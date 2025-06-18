import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

// Initialize the Supabase client
// Make sure to remove any quotes from the values in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
}

// Strip any quotes that might be present in the env variables
const cleanUrl = supabaseUrl.replace(/["']/g, '');
const cleanKey = supabaseAnonKey.replace(/["']/g, '');

console.log('Supabase URL:', cleanUrl);
// Don't log the full key in production, but we can log the first few characters for debugging
console.log('Supabase Key (first 10 chars):', cleanKey.substring(0, 10) + '...');

export const supabase = createClient<Database>(cleanUrl, cleanKey);

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  
  return data?.user || null;
};

// Helper function to get the current session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  
  return data?.session || null;
};
