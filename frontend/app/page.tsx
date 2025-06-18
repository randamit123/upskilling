'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isInitialized } = useAuthStore();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isInitialized && user && !isLoading) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, isInitialized, router]);

  // Show loading while initializing or checking auth state
  if (!isInitialized || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not logged in, show the auth form
  return (
    <div className="min-h-screen bg-muted/30">
      <AuthForm />
    </div>
  );
}
