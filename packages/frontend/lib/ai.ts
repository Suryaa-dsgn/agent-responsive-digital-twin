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
    redisClient = new Redis(redisUrl);
  }
  
  return redisClient;
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
  const maxRequestsPerInterval = RATE_LIMIT;
  const resetIntervalSec = RATE_LIMIT_WINDOW_SEC;
  const key = `ratelimit:${identifier}`;
  
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
}
