'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { apiClient } from './api';

interface BackendContextType {
  isBackendAvailable: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  checkBackend: () => Promise<void>;
}

// Default context value
const defaultContextValue: BackendContextType = {
  isBackendAvailable: false,
  isChecking: true,
  lastChecked: null,
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

  const checkBackend = async () => {
    setIsChecking(true);
    try {
      const available = await apiClient.isBackendAvailable();
      setIsBackendAvailable(available);
      setLastChecked(new Date());
    } catch (error) {
      setIsBackendAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkBackend();
    
    // Set up periodic checks
    const intervalId = setInterval(checkBackend, checkInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [checkInterval]);
  
  const value = {
    isBackendAvailable,
    isChecking,
    lastChecked,
    checkBackend
  };
  
  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
}
