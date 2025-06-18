'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, Users, FileCheck, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export const AuthForm = () => {
  const router = useRouter();
  const { 
    signUp, 
    signIn, 
    resetPassword, 
    resendConfirmation,
    isLoading, 
    error, 
    setError, 
    user,
    session
  } = useAuthStore();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Clear form errors when switching tabs or when component unmounts
  useEffect(() => {
    setFormError(null);
    setError(null);
  }, [authMode, setError]);

  // Enhanced redirect logic with debugging
  useEffect(() => {
    console.log('AuthForm: Checking redirect conditions:', {
      user: !!user,
      session: !!session,
      isLoading,
      userEmail: user?.email
    });
    
    if (user && session && !isLoading) {
      console.log('AuthForm: Redirecting to dashboard...');
      // Use replace instead of push to avoid adding to browser history
      router.replace('/dashboard');
    }
  }, [user, session, isLoading, router]);

  const validateForm = () => {
    setFormError(null);
    setError(null);
    
    if (!email || !password) {
      setFormError('Email and password are required');
      return false;
    }
    
    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
      
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (authMode === 'signup') {
        await signUp(email, password);
        // Don't navigate here - let the auth state listener handle it
        // or show success message if email confirmation is required
      } else {
        await signIn(email, password);
        // Don't navigate here - let the auth state listener handle it
      }
    } catch (err) {
      // Error is already handled in the store
      console.error('Auth error:', err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetPasswordEmail || !resetPasswordEmail.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    try {
      await resetPassword(resetPasswordEmail);
      setResetSuccess(true);
      setResetPasswordEmail('');
      // Close dialog automatically after 3 seconds
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      // Error is already handled in the store
      console.error('Reset password error:', err);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address first');
      return;
    }
    
    try {
      await resendConfirmation(email);
    } catch (err) {
      console.error('Resend confirmation error:', err);
    }
  };

  // Clear form when switching modes
  const handleTabChange = (value: string) => {
    setAuthMode(value as 'login' | 'signup');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormError(null);
    setError(null);
  };

  // Check if the error suggests the user should try a different action
  const isUserAlreadyRegisteredError = error?.includes('already registered') || false;
  const isInvalidCredentialsError = error?.includes('Invalid email or password') || false;
  const isEmailConfirmationError = error?.includes('confirm your email') || error?.includes('confirmation link') || false;
  const isSuccessMessage = error?.includes('successfully') || error?.includes('sent!') || false;

  // Enhanced manual redirect with better debugging
  const handleManualRedirect = async () => {
    console.log('Manual redirect clicked!');
    console.log('Current auth state:', { user: !!user, session: !!session, isLoading });
    
    try {
      // Force navigation
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Manual redirect error:', err);
      // Fallback
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left side - branding and features */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 to-primary/70 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Leidos Upskilling Hub" 
                className="h-12 w-12 bg-white rounded-lg p-2"
              />
              <h1 className="text-4xl font-bold tracking-tight">Leidos Upskilling Hub</h1>
            </div>
            <p className="text-lg text-white/80">
              Create, curate, and communicate learning experiences for the next generation workforce
            </p>
          </div>
          
          <div className="space-y-6 pt-8">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Course Development</h3>
                <p className="text-sm text-white/70">Create comprehensive learning courses with AI assistance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Assessment Generation</h3>
                <p className="text-sm text-white/70">Generate assessments aligned with learning objectives</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Skills-Based Learning</h3>
                <p className="text-sm text-white/70">Design learning journeys mapped to skills taxonomy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - authentication form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-none md:shadow-md md:border">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to access instructional design and content creation tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Debug info for logged in users */}
            {user && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="flex flex-col space-y-2">
                    <span>You are logged in as {user.email}</span>
                    <Button 
                      onClick={handleManualRedirect}
                      className="w-full"
                      size="sm"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue={authMode} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {(error || formError) && (
                <Alert variant={isSuccessMessage ? "default" : "destructive"} className="mb-4">
                  <div className="flex items-start space-x-2">
                    {isSuccessMessage ? (
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        {formError || error}
                      </AlertDescription>
                      
                      {/* Show helpful action buttons based on error type */}
                      {isUserAlreadyRegisteredError && authMode === 'signup' && (
                        <div className="mt-3 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAuthMode('login')}
                            className="w-full"
                          >
                            Switch to Login
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResendConfirmation}
                            disabled={isLoading}
                            className="w-full"
                          >
                            <Mail className="mr-2 h-3 w-3" />
                            Resend Confirmation Email
                          </Button>
                        </div>
                      )}
                      
                      {isInvalidCredentialsError && authMode === 'login' && (
                        <div className="mt-3 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResendConfirmation}
                            disabled={isLoading}
                            className="w-full"
                          >
                            <Mail className="mr-2 h-3 w-3" />
                            Resend Confirmation Email
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete="email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    />
                  </div>
                  
                  {authMode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {authMode === 'signup' ? 'Creating account...' : 'Logging in...'}
                      </>
                    ) : (
                      authMode === 'signup' ? 'Create Account' : 'Log In'
                    )}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            {authMode === 'login' && (
              <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="px-0 text-primary hover:text-primary/80">
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset your password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {resetSuccess ? (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Check your email for a link to reset your password.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={resetPasswordEmail}
                          onChange={(e) => setResetPasswordEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <DialogClose asChild>
                          <Button variant="outline" type="button" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Reset Link'
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
