'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { apiClient } from './api';

interface BackendContextType {
  isBackendAvailable: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  failureCount: number;
  checkBackend: () => Promise<void>;
}

// Default context value
const defaultContextValue: BackendContextType = {
  isBackendAvailable: false,
  isChecking: true,
  lastChecked: null,
  error: null,
  failureCount: 0,
  checkBackend: async () => {}
};

// Create context
export const BackendContext = createContext<BackendContextType>(defaultContextValue);

// Custom hook to use the backend context
export function useBackend() {
  return useContext(BackendContext);
}

interface BackendProviderProps {
  children: ReactNode;
  checkInterval?: number; // in milliseconds
}

/**
 * Provider component that wraps your app and makes backend status
 * available throughout the application.
 */
export function BackendProvider({ 
  children, 
  checkInterval = 30000  // Check every 30 seconds by default
}: BackendProviderProps) {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [retryTimeout, setRetryTimeout] = useState<number>(checkInterval);

  const checkBackend = useCallback(async () => {
    setIsChecking(true);
    try {
      const available = await apiClient.isBackendAvailable();
      setIsBackendAvailable(available);
      setLastChecked(new Date());
      setError(null); // Clear any previous errors
      setFailureCount(0); // Reset failure count on success
      setRetryTimeout(checkInterval); // Reset retry timeout
    } catch (error) {
            setIsBackendAvailable(false);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Calculate next failure count first
      const nextFailure = failureCount + 1;
      setFailureCount(nextFailure);
      
      // Implement exponential backoff for retry (capped at 5 minutes) using nextFailure
      const newTimeout = Math.min(
        checkInterval * Math.pow(2, nextFailure),
        300000 // 5 minutes max
      );
      setRetryTimeout(newTimeout);
    } finally {
      setIsChecking(false);
    }
  }, [checkInterval, failureCount]);

  useEffect(() => {
    // Initial check
    checkBackend();
    
    // Set up periodic checks with dynamic timeout
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextCheck = () => {
      timeoutId = setTimeout(() => {
        checkBackend();
        scheduleNextCheck();
      }, retryTimeout);
    };
    
    scheduleNextCheck();
    
    // Clean up on unmount
    return () => clearTimeout(timeoutId);
  }, [checkBackend, retryTimeout]);
  
  const value = {
    isBackendAvailable,
    isChecking,
    lastChecked,
    error,
    failureCount,
    checkBackend
  };
  
  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
}
