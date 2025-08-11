import { NextRequest } from 'next/server';

/**
 * API Evolution Demo Handler
 * Demonstrates the difference between traditional and AI-first API responses
 */
export async function POST(request: NextRequest) {
  try {
    // Check content type
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
    
    // Parse request body
    const body = await request.json();
    const { version } = body;
    
    // Validate version
    if (!version || (version !== 'traditional' && version !== 'ai-first')) {
      // Return different error types based on version
      if (version === 'traditional') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid parameters',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid API version specified',
            details: {
              parameter: 'version',
              provided: version,
              allowed: ['traditional', 'ai-first']
            },
            remediation: [
              'Check the version parameter value',
              'Ensure version is either "traditional" or "ai-first"',
              'Verify your API documentation for correct parameter values'
            ]
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Simulate a successful response
    if (version === 'traditional') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: '12345',
            status: 'processed',
            timestamp: new Date().toISOString()
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // AI-first response with more context
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: '12345',
            status: 'processed',
            timestamp: new Date().toISOString(),
            context: {
              operation: 'data_processing',
              next_steps: ['validation', 'enrichment', 'storage'],
              related_resources: [
                {
                  type: 'documentation',
                  url: 'https://example.com/api/docs'
                }
              ]
            }
          },
          meta: {
            processing_time_ms: 142,
            version: '1.0.0'
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    // Error handling with different formats based on API version
    const requestUrl = new URL(request.url);
    const versionParam = requestUrl.searchParams.get('version') || 'traditional';
    
    if (versionParam === 'traditional') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // More descriptive error for AI-first
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Request processing failed',
          details: {
            error_type: error instanceof Error ? error.name : 'UnknownError',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            request_id: `req_${Date.now().toString(36)}`,
            timestamp: new Date().toISOString()
          },
          remediation: [
            'Verify your request format and parameters',
            'Check our documentation for correct API usage',
            'If the problem persists, contact support with your request ID'
          ]
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}
