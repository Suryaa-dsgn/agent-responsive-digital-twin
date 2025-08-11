import Anthropic from '@anthropic-ai/sdk';
import { AgentOptions } from '@/types/agent';
import Redis from 'ioredis';

// Store the Anthropic client as a singleton
let anthropicClient: Anthropic | null = null;

/**
 * Get the Anthropic client instance
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    
    anthropicClient = new Anthropic({
      apiKey,
    });
  }
  
  return anthropicClient;
}

/**
 * Get default options for Claude API calls
 */
export function getDefaultOptions(): Required<AgentOptions> {
  return {
    model: 'claude-3-opus-20240229', // Default to most capable model
    max_tokens: 1024,
    temperature: 0.7,
  };
}

/**
 * Merge user options with default options
 */
export function mergeWithDefaultOptions(options?: AgentOptions): Required<AgentOptions> {
  const defaults = getDefaultOptions();
  
  if (!options) {
    return defaults;
  }
  
  return {
    model: options.model || defaults.model,
    max_tokens: clamp(
      options.max_tokens ?? defaults.max_tokens,
      1,
      4096
    ),
    temperature: clamp(
      options.temperature ?? defaults.temperature,
      0,
      1
    ),
  };
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Redis client singleton
let redisClient: Redis | null = null;

/**
 * Get the Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    try {
      // Redis client configuration with retry strategy
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000); // Exponential backoff with cap
          console.log(`Redis connection attempt ${times}, retrying in ${delay}ms`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableOfflineQueue: true,
      });
      
      // Event handlers
      redisClient.on('error', (err) => {
        console.error('Redis client error:', err);
        // Don't crash the process, just log the error
      });
      
      redisClient.on('connect', () => {
        console.log('Redis client connected');
      });
      
      redisClient.on('ready', () => {
        console.log('Redis client ready');
      });
      
      redisClient.on('close', () => {
        console.log('Redis client connection closed');
      });
      
      redisClient.on('reconnecting', () => {
        console.log('Redis client reconnecting');
      });
      
    } catch (error) {
      console.error('Error creating Redis client:', error);
      console.warn('Redis client creation failed, rate limiting will be disabled');
      // Create a minimal mock Redis client that implements required methods
      redisClient = createMockRedisClient();
    }
  }
  
  return redisClient;
}

/**
 * Creates a mock Redis client that implements basic Redis functionality in memory
 * Used as fallback when Redis connection fails
 */
function createMockRedisClient(): Redis {
  // In-memory storage for key values and expirations
  const storage = new Map<string, number>();
  const expirations = new Map<string, number>();
  const eventHandlers = new Map<string, Set<Function>>();

  const mockClient = {
    // Atomically increment a key's value and return the new value
    incr: async (key: string): Promise<number> => {
      const currentValue = storage.get(key) || 0;
      const newValue = currentValue + 1;
      storage.set(key, newValue);
      return newValue;
    },
    
    // Set a TTL for a key (in seconds)
    expire: async (key: string, seconds: number): Promise<number> => {
      if (!storage.has(key)) return 0;
      
      const expirationTime = Date.now() + (seconds * 1000);
      expirations.set(key, expirationTime);
      return 1;
    },
    
    // Get remaining TTL for a key (in seconds)
    ttl: async (key: string): Promise<number> => {
      if (!storage.has(key)) return -2; // Key doesn't exist
      
      const expiration = expirations.get(key);
      if (!expiration) return -1; // Key exists but has no expiration
      
      const remainingMs = expiration - Date.now();
      if (remainingMs <= 0) {
        // Key has expired, clean it up
        storage.delete(key);
        expirations.delete(key);
        return -2;
      }
      
      return Math.ceil(remainingMs / 1000);
    },
    
    // Register event handler
    on: (event: string, callback: Function): Redis => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, new Set());
      }
      eventHandlers.get(event)?.add(callback);
      return mockClient as unknown as Redis;
    },
    
    // Remove event handler
    off: (event: string, callback: Function): Redis => {
      eventHandlers.get(event)?.delete(callback);
      return mockClient as unknown as Redis;
    },
    
    // Emit an event (internal use)
    emit: (event: string, ...args: any[]): boolean => {
      const handlers = eventHandlers.get(event);
      if (handlers) {
        Array.from(handlers).forEach(handler => {
          handler(...args);
        });
        return handlers.size > 0;
      }
      return false;
    }
  } as unknown as Redis;
  
  return mockClient;
}

// Rate limiter constants
export const RATE_LIMIT = 10; // Maximum requests per interval
export const RATE_LIMIT_WINDOW_SEC = 60; // 1 minute window

/**
 * Check if a request exceeds rate limits using Redis
 * Provides a distributed rate limiter implementation that works across multiple instances
 */
export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; limit: number; reset: number }> {
  const redis = getRedisClient();
  
  // Redis client should always be available (real or mock)
  if (!redis) {
    throw new Error('Redis client unexpectedly not available');
  }
  
  const maxRequestsPerInterval = RATE_LIMIT;
  const resetIntervalSec = RATE_LIMIT_WINDOW_SEC;
  const key = `ratelimit:${identifier}`;
  
  try {
    // First, increment the counter
    const incrResult = await redis.incr(key);
    
    // Get TTL for calculating reset time
    let ttl = await redis.ttl(key);
    
    // If this is the first request (counter = 1), set the expiry
    if (incrResult === 1) {
      await redis.expire(key, resetIntervalSec);
      ttl = resetIntervalSec;
    } else if (ttl === -1) {
      // For existing keys, check if TTL exists; if not (e.g., -1), set it
      await redis.expire(key, resetIntervalSec);
      ttl = resetIntervalSec;
    }
    
    // Calculate reset timestamp in seconds (Unix timestamp)
    const resetTimestamp = Math.ceil(Date.now() / 1000) + ttl;
    
    // Check if the request exceeds the limit
    if (incrResult > maxRequestsPerInterval) {
      return { 
        allowed: false, 
        remaining: 0,
        limit: maxRequestsPerInterval,
        reset: resetTimestamp
      };
    }
    
    return {
      allowed: true,
      remaining: maxRequestsPerInterval - incrResult,
      limit: maxRequestsPerInterval,
      reset: resetTimestamp
    };
  } catch (error) {
    console.error('Redis rate limit check failed:', error);
    // Fail open - allow the request when Redis is down
    // Use RATE_LIMIT - 1 to account for current request while keeping consistent with allowed:true
    return { allowed: true, remaining: RATE_LIMIT - 1, limit: RATE_LIMIT, reset: Math.ceil(Date.now() / 1000) + RATE_LIMIT_WINDOW_SEC };
  }
}
