/**
 * Common API response types
 */

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Backend API client types
 */
export interface VerifyRequest {
  version: 'traditional' | 'ai-first';
}

export interface TraditionalApiResponse extends ApiResponse {
  status: string;
  message: string;
}

export interface AiFirstApiResponse extends ApiResponse {
  status: string;
  remediation?: {
    steps: string[];
  };
  recommendedNextAction?: string;
  context?: Record<string, unknown>;
  retryable?: boolean;
  machineReadable?: boolean;
}
