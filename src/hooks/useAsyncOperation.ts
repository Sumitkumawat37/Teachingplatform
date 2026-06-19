import { useState, useCallback } from 'react';
import { handleError, getUserFriendlyMessage, logError } from '@/lib/error-handler';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showUserError?: boolean;
}

export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (operation: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const appError = handleError(err, 'useAsyncOperation');
      setError(appError);
      logError(appError, 'useAsyncOperation');
      options.onError?.(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  const userErrorMessage = error ? getUserFriendlyMessage(error) : null;

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
    userErrorMessage,
  };
}
