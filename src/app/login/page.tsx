'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock login - in production, this would use Supabase auth
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Premium background with subtle gradient mesh */}
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[var(--primary)]/5 to-transparent rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] px-6 animate-fade-in-up">
        {/* Logo and brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6 animate-float">
            <div className="relative w-20 h-20">
              <Image
                src="/RuleKit-Slate-Blue.svg"
                alt="RuleKit Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mb-2">
            Welcome back
          </h1>
          <p className="text-[var(--muted-foreground)] text-base">
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--border)] p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 text-[15px] bg-[var(--background)] border-[var(--border)] rounded-xl transition-all duration-200 hover:border-[var(--muted-foreground)]/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 text-[15px] bg-[var(--background)] border-[var(--border)] rounded-xl transition-all duration-200 hover:border-[var(--muted-foreground)]/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 text-[15px] font-medium gradient-primary text-white rounded-xl shadow-md shadow-[var(--primary)]/20 hover:shadow-lg hover:shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--card)] px-3 text-[var(--muted-foreground)]">
                New to the platform?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="w-full h-12 text-[15px] font-medium text-[var(--foreground)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Create an account
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-[var(--primary)] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
