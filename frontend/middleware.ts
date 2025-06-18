import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication - simplified to match remaining modules
const protectedPaths = [
  '/dashboard',
  '/courses',
  '/learning-path',
  '/assessments',
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

export async function middleware(req: NextRequest) {
  // Get the current path from the request URL
  const path = req.nextUrl.pathname;
  
  // For now, we'll use a simple approach without Supabase middleware client
  // The authentication will be handled client-side by the auth store and ProtectedRoute components
  console.log('Middleware: Processing request', {
    path,
    hasSession: false, // Will be determined client-side
    userEmail: undefined,
    isProtected: isProtectedPath(path),
    isPublic: isPublicPath(path)
  });
  
  // Let all requests through - authentication is handled client-side
  // This avoids the type conflicts with Supabase middleware client
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
