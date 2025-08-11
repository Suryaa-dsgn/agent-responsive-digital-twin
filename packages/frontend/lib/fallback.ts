/**
 * Fallback utilities for handling backend unavailability
 */

/**
 * Generate mock data for when backend is unavailable
 * @param type The type of mock data to generate
 * @returns Mock data object
 */
export function getMockData(type: 'user' | 'api-response' | 'demo-data') {
  switch (type) {
    case 'user':
      return {
        id: 'mock-user-1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'viewer'
      };
    
    case 'api-response':
      return {
        success: true,
        data: {
          message: 'This is simulated data since the backend is unavailable.',
          timestamp: new Date().toISOString(),
          source: 'frontend-fallback'
        }
      };
      
    case 'demo-data':
      return {
        title: 'Demo Data (Offline Mode)',
        items: [
          { id: 1, name: 'Simulated Item 1', status: 'active' },
          { id: 2, name: 'Simulated Item 2', status: 'pending' },
          { id: 3, name: 'Simulated Item 3', status: 'completed' }
        ],
        lastUpdated: new Date().toISOString()
      };
      
    default:
      return { error: 'Unknown mock data type requested' };
  }
}

/**
 * Wraps an async function with a fallback in case of failure
 * @param asyncFn The async function to execute
 * @param fallbackData The fallback data to return if the function fails
 * @param timeoutMs Optional timeout in milliseconds
 * @returns Result of asyncFn or fallbackData if it fails
 */
export async function withFallback<T>(
  asyncFn: () => Promise<T>,
  fallbackData: T,
  timeoutMs = 5000
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
  });

  try {
    return await Promise.race([asyncFn(), timeoutPromise]);
  } catch (error) {
    console.warn('Operation failed, using fallback data:', error);
    return fallbackData;
  }
}

/**
 * Create a proxy API client that provides fallback responses
 * @param apiClient The real API client
 * @param isBackendAvailable Function that checks if backend is available
 * @returns Proxied API client that handles failures gracefully
 */
export function createFallbackApiClient<T extends Record<string, any>>(
  apiClient: T,
  isBackendAvailable: () => Promise<boolean>
): T {
  return new Proxy(apiClient, {
    get(target, prop) {
      const originalMethod = target[prop as keyof T];
      
      if (typeof originalMethod === 'function') {
        return async (...args: any[]) => {
          const backendAvailable = await withFallback(
            isBackendAvailable,
            false, // Assume unavailable if check fails
            2000    // Short timeout for availability check
          );
          
          if (backendAvailable) {
            try {
              return await originalMethod.apply(target, args);
            } catch (error) {
              console.error(`API call to ${String(prop)} failed:`, error);
              return getMockData('api-response');
            }
          } else {
            console.warn(`Backend unavailable, using mock data for ${String(prop)}`);
            return getMockData('api-response');
          }
        };
      }
      
      return originalMethod;
    }
  });
}
