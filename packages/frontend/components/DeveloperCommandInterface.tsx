'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Example prompts to show as suggestions
const EXAMPLE_PROMPTS = [
  "Summarize the latest bug reports from JIRA",
  "Create a unit test for the authentication service",
  "Explain the architecture of our caching system",
  "Generate a PR description for my feature branch",
  "Review my code for potential security issues"
];

export function DeveloperCommandInterface() {
  // Component state
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState(-1);
  
  // Refs for element access
  const responseAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll response area as new content comes in
  useEffect(() => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [response]);
  
  // Cleanup effect for aborting any in-flight requests when unmounting
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResponse('');
    
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      // Call the API with streaming response
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Process the streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          accumulatedResponse += chunk;
          setResponse(accumulatedResponse);
        }
      } catch (error) {
        // Only rethrow if it's not an abort error
        const readerError = error as Error;
        if (readerError.name !== 'AbortError') {
          throw readerError;
        }
        // For AbortError, just exit silently
      } finally {
        // Always release the reader lock if we have a reader
        try {
          reader.releaseLock();
        } catch (e) {
          // Ignore errors during releaseLock
        }
      }
    } catch (error) {
      // Don't show AbortError to the user as it's an intentional cancellation
      const err = error as Error;
      if (err.name !== 'AbortError') {
        console.error('Error fetching response:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      // Reset loading state and clear the abort controller reference
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Use an example prompt
  const useExamplePrompt = (index: number) => {
    setPrompt(EXAMPLE_PROMPTS[index]);
    setSelectedExample(index);
    if (formRef.current) {
      const textarea = formRef.current.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Component header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">Developer Command Interface</h2>
        <p className="text-sm text-gray-600">Enter your development goals and get AI assistance</p>
      </div>

      {/* Main content area */}
      <div className="p-4">
        {/* Response area */}
        <div 
          ref={responseAreaRef}
          className={`mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 font-mono text-sm overflow-y-auto h-[300px] whitespace-pre-wrap ${!response && !isLoading ? 'flex items-center justify-center text-gray-400' : ''}`}
          aria-live="polite"
        >
          {response ? (
            <div className="prose max-w-none">{response}</div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <span>AI responses will appear here</span>
          )}
        </div>

        {/* Input form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="prompt" className="sr-only">Enter your development goal</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your development goal or question..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              aria-describedby="prompt-examples"
            />
          </div>

          {/* Example prompts */}
          <div id="prompt-examples" className="flex flex-wrap gap-2 text-sm">
            <span className="text-gray-600 mr-1">Examples:</span>
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => useExamplePrompt(index)}
                className={`px-2 py-1 rounded text-xs ${selectedExample === index ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                {example.length > 30 ? example.substring(0, 27) + '...' : example}
              </button>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeveloperCommandInterface;
