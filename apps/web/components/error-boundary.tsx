"use client";

import React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Optional Sentry import - gracefully handle if not available
let Sentry: any = null;
try {
  Sentry = require("@sentry/nextjs");
} catch (error) {
  // Silently handle missing Sentry - it's optional
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  eventId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry if available
    let eventId: string | undefined;
    if (Sentry) {
      try {
        eventId = Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
          tags: {
            component: "ErrorBoundary",
          },
        });
      } catch (sentryError) {
        console.warn("Failed to log to Sentry:", sentryError);
      }
    }

    this.setState({ eventId });

    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, eventId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          resetError={this.resetError}
          eventId={this.state.eventId}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
  eventId?: string;
}

function DefaultErrorFallback({
  error,
  resetError,
  eventId,
}: DefaultErrorFallbackProps) {
  const handleReportError = () => {
    if (eventId && Sentry) {
      try {
        Sentry.showReportDialog({ eventId });
      } catch (error) {
        console.warn("Failed to show Sentry report dialog:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Something went wrong
          </CardTitle>
          <CardDescription>
            We're sorry, but something unexpected happened. Our team has been
            notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-gray-100 p-3">
              <p className="text-sm font-medium text-gray-700">
                Error Details:
              </p>
              <p className="text-sm text-gray-600 mt-1">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            {eventId && (
              <Button
                onClick={handleReportError}
                variant="outline"
                className="w-full"
              >
                Report Issue
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    if (Sentry) {
      try {
        Sentry.captureException(error, {
          contexts: {
            react: errorInfo
              ? { componentStack: errorInfo.componentStack }
              : undefined,
          },
          tags: {
            component: "useErrorHandler",
          },
        });
      } catch (sentryError) {
        console.warn("Failed to log to Sentry:", sentryError);
      }
    }
    console.error("Error in useErrorHandler:", error, errorInfo);
  };
}
