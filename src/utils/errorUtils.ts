// Error handling utilities
import { useToast } from '@/components/ui/use-toast';

export enum ErrorCode {
  // Network errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  RECONNECTION_FAILED = 'RECONNECTION_FAILED',
  
  // Draft errors
  DRAFT_NOT_FOUND = 'DRAFT_NOT_FOUND',
  DRAFT_NOT_ACTIVE = 'DRAFT_NOT_ACTIVE',
  INVALID_PHASE = 'INVALID_PHASE',
  WRONG_TEAM_TURN = 'WRONG_TEAM_TURN',
  CHAMPION_ALREADY_SELECTED = 'CHAMPION_ALREADY_SELECTED',
  INVALID_TEAM_ACTION = 'INVALID_TEAM_ACTION',
  
  // Validation errors
  INVALID_DRAFT_ID = 'INVALID_DRAFT_ID',
  INVALID_TEAM_NAME = 'INVALID_TEAM_NAME',
  DUPLICATE_TEAM_NAMES = 'DUPLICATE_TEAM_NAMES',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    public originalError?: Error,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error, context?: Record<string, any>) {
    super(message, ErrorCode.CONNECTION_FAILED, originalError, context);
    this.name = 'NetworkError';
  }
}

export class DraftError extends AppError {
  constructor(message: string, code: ErrorCode, context?: Record<string, any>) {
    super(message, code, undefined, context);
    this.name = 'DraftError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: ErrorCode, context?: Record<string, any>) {
    super(message, code, undefined, context);
    this.name = 'ValidationError';
  }
}

// Error message mapping for user-friendly messages
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.CONNECTION_FAILED]: 'Unable to connect to the draft server. Please check your internet connection.',
  [ErrorCode.CONNECTION_TIMEOUT]: 'Connection timed out. Please try again.',
  [ErrorCode.RECONNECTION_FAILED]: 'Failed to reconnect to the server. Please refresh the page.',
  
  [ErrorCode.DRAFT_NOT_FOUND]: 'Draft session not found. Please check the draft ID.',
  [ErrorCode.DRAFT_NOT_ACTIVE]: 'This draft is not currently active.',
  [ErrorCode.INVALID_PHASE]: 'Invalid draft phase. Please refresh the page.',
  [ErrorCode.WRONG_TEAM_TURN]: "It's not your turn to make a selection.",
  [ErrorCode.CHAMPION_ALREADY_SELECTED]: 'This champion has already been selected or banned.',
  [ErrorCode.INVALID_TEAM_ACTION]: 'This action is not allowed for your team role.',
  
  [ErrorCode.INVALID_DRAFT_ID]: 'Invalid draft ID provided.',
  [ErrorCode.INVALID_TEAM_NAME]: 'Invalid team name provided.',
  [ErrorCode.DUPLICATE_TEAM_NAMES]: 'Team names must be different.',
  
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCode.SERVER_ERROR]: 'Server error occurred. Please try again later.',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | AppError): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }
  
  // Handle common error patterns
  if (error.message.includes('network') || error.message.includes('connection')) {
    return ERROR_MESSAGES[ErrorCode.CONNECTION_FAILED];
  }
  
  if (error.message.includes('timeout')) {
    return ERROR_MESSAGES[ErrorCode.CONNECTION_TIMEOUT];
  }
  
  return ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Create error from socket error event
 */
export function createErrorFromSocketEvent(errorData: { message: string; code?: string }): AppError {
  const code = (errorData.code as ErrorCode) || ErrorCode.SERVER_ERROR;
  return new AppError(errorData.message, code);
}

/**
 * Log error with context
 */
export function logError(error: Error, context?: Record<string, any>) {
  console.error('Application Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // In production, you would send this to your error tracking service
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Handle error with toast notification
 */
export function useErrorHandler() {
  const { toast } = useToast();
  
  return (error: Error | AppError, context?: Record<string, any>) => {
    logError(error, context);
    
    const message = getUserFriendlyMessage(error);
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const err = error as Error;
    logError(err);
    onError?.(err);
    return fallback;
  }
}

/**
 * Debounced error handler to prevent spam
 */
export function createDebouncedErrorHandler(delay: number = 1000) {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastError: Error | null = null;
  
  return (error: Error, handler: (error: Error) => void) => {
    lastError = error;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (lastError) {
        handler(lastError);
        lastError = null;
      }
      timeoutId = null;
    }, delay);
  };
}
