import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Define paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/courses',
  '/microlearning',
  '/assessments',
  '/learning-path',
  '/knowledge',
  '/tagging',
  '/profile',
  '/survey',
  '/roles',
  '/comms',
  '/impact',
  '/api/embeddings',
];

// Define paths that are public (no auth required)
const publicPaths = ['/', '/auth', '/api/auth'];

// Check if the path is protected
function isProtectedPath(path: string): boolean {
  return protectedPaths.some(prefix => path.startsWith(prefix));
}

// Check if the path is public
function isPublicPath(path: string): boolean {
  return publicPaths.some(prefix => path === prefix);
}

export async function middleware(request: NextRequest) {
  // Create a response to modify
  const response = NextResponse.next();
  
  // Create a Supabase client using the auth-helpers-nextjs
  const supabase = createMiddlewareClient<Database>({ 
    req: request, 
    res: response 
  });
  
  // Get the session from Supabase
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  
  // Get the current path from the request URL
  const path = request.nextUrl.pathname;
  
  // If this is a protected path and there's no session, redirect to homepage
  if (isProtectedPath(path) && !session) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and they're trying to access the auth page, redirect to dashboard
  if (session && path === '/auth') {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
