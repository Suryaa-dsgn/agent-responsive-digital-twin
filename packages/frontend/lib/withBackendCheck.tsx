import { ComponentType, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from './api';
import BackendStatus from '@/components/BackendStatus';

/**
 * Higher-order component to check backend availability
 * Wraps a component with backend status check and fallback UI
 * 
 * @param Component The component to wrap
 * @param fallback Optional custom fallback component to show when backend is unavailable
 * @returns A new component that includes backend status checking
 */
export function withBackendCheck<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
): ComponentType<P> {
  return function WithBackendCheck(props: P) {
    return (
      <BackendStatus fallback={fallback}>
        <Component {...props} />
      </BackendStatus>
    );
  };
}

/**
 * Custom hook to check backend connectivity status
 * @returns Object with isAvailable, isChecking, and retry function
 */
export function useBackendStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const available = await apiClient.isBackendAvailable();
      setIsAvailable(available);
    } catch (error) {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    isAvailable,
    isChecking,
    retry: checkStatus
  };
}
