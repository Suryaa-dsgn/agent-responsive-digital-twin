'use client';

import { useState } from 'react';
import { useBackend } from '@/lib/BackendContext';
import { apiClient } from '@/lib/api';

/**
 * Simple component to test backend connectivity
 */
export default function BackendConnectionTest() {
  const { isBackendAvailable, isChecking, checkBackend } = useBackend();
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/health');
      setTestResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-md">
      <h2 className="text-lg font-semibold mb-4">Backend Connection Test</h2>
      
      <div className="mb-4 flex items-center space-x-2">
        <span>Status:</span>
        {isChecking ? (
          <span className="text-gray-500">Checking...</span>
        ) : isBackendAvailable ? (
          <span className="text-green-500 font-medium">Connected</span>
        ) : (
          <span className="text-red-500 font-medium">Disconnected</span>
        )}
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={checkBackend}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Refresh Status
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {testResponse && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Response:</h3>
          <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-40 text-sm">
            {JSON.stringify(testResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
