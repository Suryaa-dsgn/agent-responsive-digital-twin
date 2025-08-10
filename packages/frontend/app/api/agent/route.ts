import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import axios from 'axios';
import { getEnvVar } from '../../../lib/validateEnv';

// Define API base URL for backend communication - safe to use getEnvVar in server components
const API_BASE_URL = getEnvVar('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3001') + '/api/v1';

/**
 * Agent API route that proxies requests to the backend service
 */
// Define the schema for request validation
const agentRequestSchema = z.object({
  // message is required as per backend requirements
  message: z.string().min(1, "Message cannot be empty"),
  query: z.string().optional(),
  options: z.object({
    model: z.string().optional(),
    max_tokens: z.number().int().positive().max(4096).optional(),
    temperature: z.number().min(0).max(1).optional(),
  }).optional(),
}).strict();

export async function POST(request: NextRequest) {
  try {
    // Check if Content-Type is application/json
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Content-Type must be application/json' 
        },
        { status: 415 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate against schema
    const result = agentRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          details: result.error.format() 
        },
        { status: 400 }
      );
    }
    
    // Use validated data
    const validatedData = result.data;
    
    try {
      // Forward the request to the backend with timeout (30 seconds)
      const response = await axios.post(`${API_BASE_URL}/anthropic/claude`, validatedData, {
        timeout: 30000, // 30 seconds timeout
      });
      
      // Return the backend response with the original status code
      return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
      // Handle API errors - log full error for debugging but don't expose to client
      console.error('Error calling backend API:', error);
      
      // Return a generic error message without exposing internal error details
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process request'
        },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error processing request' 
      },
      { status: 500 }
    );
  }
}