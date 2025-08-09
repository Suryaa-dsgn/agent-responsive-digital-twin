/**
 * Type definitions for API responses and requests
 */

// Request types
export interface VerifyRequest {
  version: 'traditional' | 'ai-first';
  email?: string;
}

// Traditional API response types
export interface TraditionalApiResponse {
  status: string;
  message: string;
}

// AI-First API response types
export interface AiFirstApiResponse {
  status: string;
  remediation: string;
  recommendedNextAction: string;
  context: string;
  retryable: boolean;
  machineReadable: boolean;
}

// Combined response type
export type ApiResponse = TraditionalApiResponse | AiFirstApiResponse;

// Health check response
export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}
