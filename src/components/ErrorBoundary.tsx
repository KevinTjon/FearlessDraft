// Error boundary component for graceful error handling
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (if configured)
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-lol-dark p-4">
          <div className="w-full max-w-2xl">
            <Alert variant="destructive" className="border-red-500/50 bg-red-950/20">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-red-400">Something went wrong</AlertTitle>
              <AlertDescription className="mt-3 space-y-4">
                <div className="text-red-200">
                  <p className="mb-2">
                    An unexpected error occurred in the Champion Draft Arena.
                  </p>
                  {this.state.error && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-red-300 hover:text-red-200">
                        Error Details
                      </summary>
                      <div className="mt-2 p-3 bg-black/30 rounded border text-xs font-mono text-red-100 whitespace-pre-wrap">
                        <div className="text-red-400 font-bold mb-2">Error:</div>
                        {this.state.error.message}
                        
                        {this.state.error.stack && (
                          <>
                            <div className="text-red-400 font-bold mt-3 mb-2">Stack Trace:</div>
                            {this.state.error.stack}
                          </>
                        )}

                        {this.state.errorInfo?.componentStack && (
                          <>
                            <div className="text-red-400 font-bold mt-3 mb-2">Component Stack:</div>
                            {this.state.errorInfo.componentStack}
                          </>
                        )}
                      </div>
                    </details>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={this.handleRetry}
                    variant="outline"
                    className="border-red-500/30 text-red-200 hover:bg-red-950/30"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={this.handleReload}
                    className="bg-red-600 hover:bg-red-500 text-white"
                  >
                    Reload Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error reporting
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any) => {
    console.error('Error reported via hook:', error, errorInfo);
    
    // Report to error tracking service
    // reportError(error, errorInfo);
    
    // Could also trigger a toast notification
    // toast.error(error.message);
  }, []);
}
