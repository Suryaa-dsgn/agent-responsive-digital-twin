import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { PUBLIC_BACKEND_URL } from './validateEnv';
import { getMockData, withFallback } from './fallback';

// Default API configuration
const API_BASE_URL = PUBLIC_BACKEND_URL || 'http://localhost:3001';
// When using Next.js proxy, can use relative path
const IS_BROWSER = typeof window !== 'undefined';
const API_PATH = IS_BROWSER ? '/api/backend' : '/api/v1';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Create an axios instance with predefined configuration
 */
const createApiClient = (config: AxiosRequestConfig = {}): AxiosInstance => {
  return axios.create({
    baseURL: `${API_BASE_URL}${API_PATH}`,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  });
};

/**
 * Base API client with retry capabilities
 */
export const apiClient = {
  /**
   * Execute a request with automatic retries
   */
  async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const client = createApiClient(config);
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= MAX_RETRIES) {
      try {
        let response;

        switch (method) {
          case 'get':
            response = await client.get<T>(endpoint, config);
            break;
          case 'post':
            response = await client.post<T>(endpoint, data, config);
            break;
          case 'put':
            response = await client.put<T>(endpoint, data, config);
            break;
          case 'delete':
            response = await client.delete<T>(endpoint, config);
            break;
        }

        return response.data;
      } catch (error: any) {
        lastError = error;
        const isNetworkError = !error.response && error.code !== 'ECONNABORTED';
        const isRetryable = isNetworkError || (error.response && (error.response.status >= 500 || error.response.status === 429));

        if (retries >= MAX_RETRIES || !isRetryable) {
          break;
        }

        console.warn(`API request failed, retrying (${retries + 1}/${MAX_RETRIES})...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
        retries++;
      }
    }

    // Format error message
    const axiosError = lastError as AxiosError;
    // Type assertion for response.data which could be any structure
    const errorData = axiosError.response?.data as { message?: string; error?: string } | undefined;
    const errorMessage = errorData?.message 
      || errorData?.error 
      || axiosError.message 
      || 'API request failed';
    
    console.error('API request failed after retries:', {
      endpoint,
      status: axiosError.response?.status,
      message: errorMessage
    });

    throw new Error(errorMessage);
  },

  /**
   * Check if the backend is available
   * @returns true if backend is available, false otherwise
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      // Use the health endpoint through our proxy when in browser
      const healthEndpoint = IS_BROWSER ? '/health' : `${API_BASE_URL}/health`;
      
      await axios.get(healthEndpoint, { 
        timeout: 3000 
      });
      return true;
    } catch (error) {
      console.warn('Backend health check failed:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  },

  // Convenience methods
  get: <T>(endpoint: string, config?: AxiosRequestConfig) => 
    apiClient.request<T>('get', endpoint, undefined, config),
  
  post: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.request<T>('post', endpoint, data, config),
  
  put: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.request<T>('put', endpoint, data, config),
  
  delete: <T>(endpoint: string, config?: AxiosRequestConfig) => 
    apiClient.request<T>('delete', endpoint, undefined, config),
};

/**
 * Client for interacting with the Anthropic Claude API through our backend
 */
export const claudeClient = {
  /**
   * Send a message to Claude through the backend API
   * 
   * @param message - The message to send to Claude
   * @param options - Additional options for the Claude API
   * @returns The API response
   */
  sendMessage: async (message: string, options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }) => {
    try {
      return await apiClient.post('/anthropic/claude', {
        message,
        options
      });
    } catch (error: any) {
      console.error('Error calling Claude API:', error.message || 'Unknown error');
      throw new Error(error.message || 'Failed to communicate with Claude API');
    }
  }
};
