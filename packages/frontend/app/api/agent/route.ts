import { NextRequest } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicClient, mergeWithDefaultOptions, checkRateLimit, RATE_LIMIT } from '@/lib/ai';
import { AgentRequest, StreamChunk, RateLimitInfo } from '@/types/agent';
import { isIP } from 'net';

// Define validation schema for incoming requests
const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  options: z.object({
    model: z.string().optional(),
    max_tokens: z.number().int().positive().max(4096).optional(),
    temperature: z.number().min(0).max(1).optional(),
  }).optional(),
}).strict();

/**
 * Extract and validate the real client IP from request headers
 * Takes the leftmost valid public IP from X-Forwarded-For or falls back to other headers
 * Validates the IP address format before returning
 */
function getClientIp(request: NextRequest): string {
  // Function to validate IP address format
  const validateIp = (ip: string | null): string | null => {
    if (!ip) return null;
    
    // Clean the IP address - trim whitespace
    const cleanedIp = ip.trim();
    
    // Validate as IPv4 or IPv6
    if (isIP(cleanedIp)) {
      return cleanedIp;
    }
    
    return null;
  };

  // Try to get from x-forwarded-for first (format: client, proxy1, proxy2, ...)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the leftmost valid IP (client) from the comma-separated list
    const ips = forwardedFor.split(',').map(ip => validateIp(ip.trim())).filter(Boolean);
    if (ips.length > 0) {
      return ips[0]!; // Non-null assertion is safe due to filter(Boolean)
    }
  }
  
  // Try other headers if x-forwarded-for isn't available
  const realIp = validateIp(request.headers.get('x-real-ip'));
  if (realIp) return realIp;
  
  const nextIp = validateIp(request.ip || null); // Next.js may provide this in some environments
  if (nextIp) return nextIp;
  
  // Return safe sentinel value if no valid IP is found
  return 'unknown';
}

/**
 * Handler for POST requests to the agent API
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting with improved extraction
    const ip = getClientIp(request);
    
    // Check rate limit using centralized function
    const rateLimitResult = await checkRateLimit(ip);
    
    if (!rateLimitResult.allowed) {
      // Too many requests from this IP
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': `${rateLimitResult.limit}`,
            'X-RateLimit-Remaining': `${rateLimitResult.remaining}`,
            'X-RateLimit-Reset': `${rateLimitResult.reset}`,
          },
        }
      );
    }
    
    // Check for valid content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type must be application/json',
        }),
        { status: 415, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body',
          details: validationResult.error.format(),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Use validated data
    const { prompt, options } = validationResult.data as AgentRequest;
    const mergedOptions = mergeWithDefaultOptions(options);
    
    // Initialize the Anthropic client
    const anthropic = getAnthropicClient();
    
    // Create a streaming response
    const response = await anthropic.messages.create({
      model: mergedOptions.model,
      max_tokens: mergedOptions.max_tokens,
      temperature: mergedOptions.temperature,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });
    
    // Create a ReadableStream from the Anthropic response
    const stream = new ReadableStream({
      async start(controller) {
        // Process each chunk from the Anthropic stream
        for await (const chunk of response) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      }
    });
    
    // Return streaming response with rate limit headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
        'X-RateLimit-Limit': `${rateLimitResult.limit}`,
        'X-RateLimit-Remaining': `${rateLimitResult.remaining}`,
        'X-RateLimit-Reset': `${rateLimitResult.reset}`,
      },
    });
  } catch (error: unknown) {
    // Extract error details with proper type guards
    let message = 'An error occurred while processing your request';
    let status = 500;
    
    if (error instanceof Error) {
      message = error.message;
    } else if (error !== null && typeof error === 'object') {
      // Safely access potential message property
      if ('message' in error && typeof error.message === 'string') {
        message = error.message;
      }
      
      // Safely access potential status property
      if ('status' in error && typeof error.status === 'number') {
        status = error.status;
      }
    }
    
    console.error('Error processing agent request:', { message, status, error });
    
    // Return appropriate error response
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      { 
        status: status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Add CORS headers for the OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}