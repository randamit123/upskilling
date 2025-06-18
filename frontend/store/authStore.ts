import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Methods
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message || error.toString();
  
  if (message.includes('User already registered')) {
    return 'This email is already registered. Please try logging in instead, or check your email for a confirmation link.';
  }
  
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again. If you just signed up, make sure to confirm your email first.';
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  
  if (message.includes('too many requests')) {
    return 'Too many login attempts. Please wait a few minutes before trying again.';
  }
  
  if (message.includes('weak password')) {
    return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
  }
  
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  
  // Return the original message if we don't have a custom one
  return message;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            throw sessionError;
          }
          
          // Set initial auth state
          set({ 
            user: session?.user || null, 
            session: session || null,
            isInitialized: true
          });
          
          // Set up auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state changed:', event, session?.user?.email);
              
              set({ 
                user: session?.user || null, 
                session: session || null,
                error: null
              });
              
              // Clear any stale error states on successful auth changes
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                set({ error: null });
              }
            }
          );
          
          // Store subscription for cleanup if needed
          if (typeof window !== 'undefined') {
            (window as any).authSubscription = subscription;
          }
          
        } catch (error: any) {
          console.error('Auth initialization error:', error);
          set({ 
            error: getAuthErrorMessage(error),
            user: null,
            session: null,
            isInitialized: true
          });
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          // Check if email confirmation is required
          if (data.user && !data.session) {
            set({ error: 'Account created successfully! Please check your email and click the confirmation link to complete your registration.' });
          } else if (data.user && data.session) {
            // User is immediately signed in (email confirmation disabled)
            set({ error: null });
          }
        } catch (error: any) {
          const errorMessage = getAuthErrorMessage(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          // Don't set user/session here - let the auth state listener handle it
        } catch (error: any) {
          const errorMessage = getAuthErrorMessage(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            throw error;
          }
          
          // Don't set user/session here - let the auth state listener handle it
        } catch (error: any) {
          const errorMessage = getAuthErrorMessage(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          
          if (error) {
            throw error;
          }
        } catch (error: any) {
          const errorMessage = getAuthErrorMessage(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resendConfirmation: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
          });
          
          if (error) {
            throw error;
          }
          
          set({ error: 'Confirmation email sent! Please check your inbox and spam folder.' });
        } catch (error: any) {
          const errorMessage = getAuthErrorMessage(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive data and exclude loading/error states
      partialize: (state) => ({ 
        user: state.user,
        isInitialized: state.isInitialized 
      }),
    }
  )
);
