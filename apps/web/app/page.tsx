"use client";

import { useAuth } from "../lib/auth";
import { AuthPage } from "../components/auth/auth-page";
import { Dashboard } from "../components/dashboard/dashboard";
import { ErrorBoundary } from "../components/error-boundary";

export default function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-900">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">Initializing application</p>
        </div>
      </div>
    );
  }

  return <ErrorBoundary>{user ? <Dashboard /> : <AuthPage />}</ErrorBoundary>;
}
