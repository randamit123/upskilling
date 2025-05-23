'use client';

import { useState } from 'react';
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
import { Loader2, BookOpen, Users, FileCheck } from 'lucide-react';

export const AuthForm = () => {
  const router = useRouter();
  const { signUp, signIn, resetPassword, isLoading, error, setError } = useAuthStore();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    setFormError(null);
    
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
        router.push('/dashboard');
      } else {
        await signIn(email, password);
        router.push('/dashboard');
      }
    } catch (err) {
      // Error is already handled in the store
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
      // Close dialog automatically after 3 seconds
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      // Error is already handled in the store
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left side - branding and features */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 to-primary/70 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Leidos Upskilling Hub</h1>
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
            <Tabs defaultValue={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {(error || formError) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {formError || error}
                  </AlertDescription>
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
                      required
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
                      required
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
                        required
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
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <DialogClose asChild>
                          <Button variant="outline" type="button">Cancel</Button>
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
