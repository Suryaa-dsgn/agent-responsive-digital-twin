import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Example API route for agent communication
 */
// Define the schema for request validation
const agentRequestSchema = z.object({
  // Add your expected fields here
  message: z.string().optional(),
  query: z.string().optional(),
  // Add more fields as needed
});

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
    
    // Define a whitelist of safe fields to include in the response
    const safeFields = ['message', 'query']; // Only fields explicitly defined in the schema
    
    // Create a sanitized object with only whitelisted fields
    const sanitizedData = Object.fromEntries(
      Object.entries(validatedData)
        .filter(([key]) => safeFields.includes(key))
    );
    
    // Simple placeholder response for agent API with sanitized data
    return NextResponse.json({
      success: true,
      message: 'Agent API endpoint',
      data: {
        received: sanitizedData,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid request' 
      },
      { status: 400 }
    );
  }
}
