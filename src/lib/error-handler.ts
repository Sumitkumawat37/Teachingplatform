// Centralized Error Handler for Production Readiness

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  VIDEO_ERROR: 'VIDEO_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export function handleError(error: unknown, context?: string): AppError {
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Determine error type based on message
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new AppError(
        error.message,
        ErrorCodes.NETWORK_ERROR,
        503,
        { originalError: error.message }
      );
    }
    
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return new AppError(
        error.message,
        ErrorCodes.AUTH_ERROR,
        401,
        { originalError: error.message }
      );
    }

    return new AppError(
      error.message,
      ErrorCodes.UNKNOWN_ERROR,
      500,
      { originalError: error.message }
    );
  }

  return new AppError(
    'An unexpected error occurred',
    ErrorCodes.UNKNOWN_ERROR,
    500,
    { originalError: String(error) }
  );
}

export function getUserFriendlyMessage(error: AppError): string {
  switch (error.code) {
    case ErrorCodes.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection and try again.';
    case ErrorCodes.AUTH_ERROR:
      return 'Your session has expired. Please log in again.';
    case ErrorCodes.DATABASE_ERROR:
      return 'Unable to save your changes. Please try again.';
    case ErrorCodes.VALIDATION_ERROR:
      return error.message || 'Please check your input and try again.';
    case ErrorCodes.PAYMENT_ERROR:
      return 'Payment processing failed. Please try again or contact support.';
    case ErrorCodes.VIDEO_ERROR:
      return 'Unable to play video. Please check your connection.';
    case ErrorCodes.PERMISSION_ERROR:
      return 'You do not have permission to perform this action.';
    case ErrorCodes.TIMEOUT_ERROR:
      return 'Request timed out. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function logError(error: AppError, context?: string) {
  // In production, this would send to error tracking service (Sentry, etc.)
  const errorData = {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('[Error Logged]:', errorData);

  // TODO: Send to error tracking service
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { extra: errorData });
  // }
}
