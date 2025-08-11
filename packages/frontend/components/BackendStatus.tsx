import { useBackend } from '@/lib/BackendContext';
import { useState } from 'react';

/**
 * Props for BackendStatus component
 */
interface BackendStatusProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that checks backend availability and renders children or fallback
 */
export default function BackendStatus({ 
  children, 
  fallback = <DefaultUnavailableMessage /> 
}: BackendStatusProps) {
  const { isBackendAvailable, isChecking } = useBackend();

  if (isChecking) {
    return <LoadingState />;
  }

  if (isBackendAvailable === false) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Default loading state
 */
function LoadingState() {
  return (
    <div className="flex items-center justify-center p-6 border border-gray-200 rounded-lg bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-4 w-4 bg-blue-400 rounded-full mb-2"></div>
        <p className="text-sm text-gray-500">Connecting to backend...</p>
      </div>
    </div>
  );
}

/**
 * Default message shown when backend is unavailable
 */
function DefaultUnavailableMessage() {
  const { checkBackend } = useBackend();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkBackend();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-red-200 rounded-lg bg-red-50">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 text-red-500 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900">Backend Service Unavailable</h3>
      <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
        The backend API service is currently unreachable. This might be due to:
      </p>
      <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
        <li>The backend server is not running</li>
        <li>Network connectivity issues</li>
        <li>Incorrect backend URL configuration</li>
      </ul>
      <div className="mt-4">
        <button 
          onClick={handleRetry}
          disabled={isRetrying}
          className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-sm ${isRetrying ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isRetrying ? 'Retrying...' : 'Retry Connection'}
        </button>
      </div>
    </div>
  );
}
