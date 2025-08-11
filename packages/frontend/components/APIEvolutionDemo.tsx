'use client';

import { useState } from 'react';
import axios, { isAxiosError } from 'axios';

// Define types for our API responses
interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  remediation?: string[];
}

export function APIEvolutionDemo() {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiVersion, setApiVersion] = useState<'traditional' | 'ai-first' | null>(null);
  const [requestData, setRequestData] = useState<string>('');
  const [responseData, setResponseData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const makeApiCall = async (version: 'traditional' | 'ai-first') => {
    setLoading(true);
    setApiVersion(version);
    setError(null);
    
    const payload = { version };
    setRequestData(JSON.stringify(payload, null, 2));
    
    try {
      const response = await axios.post('/api/evolution-demo', payload);
      setResponseData(JSON.stringify(response.data, null, 2));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      
      if (isAxiosError(err) && err.response?.data) {
        setResponseData(JSON.stringify(err.response.data, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">API Evolution Demo</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          This demo shows the difference between traditional API responses and AI-first API responses.
          Compare how each approach affects an agent's ability to handle errors and continue execution.
        </p>
      </div>

      <div className="flex justify-center space-x-6">
        <button
          onClick={() => makeApiCall('traditional')}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-medium ${
            apiVersion === 'traditional' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Traditional API Call
        </button>
        <button
          onClick={() => makeApiCall('ai-first')}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-medium ${
            apiVersion === 'ai-first' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          AI-First API Call
        </button>
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {requestData && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Request</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {requestData}
            </pre>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Response</h3>
            <pre 
              className={`p-4 rounded-lg overflow-auto max-h-96 text-sm ${
                apiVersion === 'traditional' ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              {responseData || 'No response yet'}
            </pre>
          </div>
        </div>
      )}

      {apiVersion && (
        <div className={`p-6 border rounded-lg ${apiVersion === 'traditional' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <h3 className="text-xl font-semibold mb-4">
            {apiVersion === 'traditional' ? 'Traditional API Response' : 'AI-First API Response'}
          </h3>
          
          <div className="space-y-4">
            <h4 className="font-medium">{apiVersion === 'traditional' ? 'Limitations:' : 'Benefits:'}</h4>
            <ul className="list-disc pl-5 space-y-2">
              {apiVersion === 'traditional' ? (
                <>
                  <li>Vague error messages without clear context</li>
                  <li>No remediation steps or suggestions</li>
                  <li>AI agent gets stuck without clear path forward</li>
                  <li>Requires human intervention to interpret and solve</li>
                  <li>Interrupts automation workflows</li>
                </>
              ) : (
                <>
                  <li>Structured error details with clear context</li>
                  <li>Actionable remediation steps</li>
                  <li>AI agent can understand and self-correct</li>
                  <li>Continues execution without human intervention</li>
                  <li>Enables end-to-end automation</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="mt-6 p-4 rounded-md bg-white border">
            <h4 className="font-medium mb-2">AI Agent Response:</h4>
            <p>
              {apiVersion === 'traditional' 
                ? "I'm sorry, I encountered an error and don't know how to proceed. Can you help me interpret the error message?"
                : "I detected an issue with the request, but I can fix it automatically. I'll update the parameters and retry with the suggested corrections."}
            </p>
          </div>
        </div>
      )}

      <div className="text-center bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Why This Matters</h3>
        <p className="text-gray-700">
          AI agents need more than just data - they need context and actionable intelligence to operate autonomously.
          AI-first APIs provide rich, structured responses that enable agents to understand errors, 
          take corrective actions, and continue workflow execution without human intervention.
        </p>
      </div>
    </div>
  );
}
