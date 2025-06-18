'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Higher-order component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, isLoading, isInitialized, session } = useAuthStore();

  useEffect(() => {
    console.log('ProtectedRoute: Auth state check:', {
      user: !!user,
      session: !!session,
      isLoading,
      isInitialized,
      userEmail: user?.email
    });
    
    // Only redirect if auth is fully initialized and user is not authenticated
    if (isInitialized && !isLoading && !user) {
      console.log('ProtectedRoute: Redirecting to home (not authenticated)');
      router.replace('/');
    }
  }, [user, isLoading, isInitialized, session, router]);

  // Show loading while initializing or checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If auth is initialized and we have a user, show the protected content
  // If auth is initialized and no user, the useEffect above will redirect
  return user ? <>{children}</> : null;
};
