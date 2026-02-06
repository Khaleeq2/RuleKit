'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Premium background with subtle gradient mesh */}
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[var(--accent)]/5 to-transparent rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] px-6 animate-fade-in-up">
        {/* Logo and brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-[var(--primary)]/25 mb-6 animate-float">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mb-2">
            Create your account
          </h1>
          <p className="text-[var(--muted-foreground)] text-base">
            Start building powerful rule-based validations
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--border)] p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-[var(--foreground)]">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 px-4 text-[15px] bg-[var(--background)] border-[var(--border)] rounded-xl transition-all duration-200 hover:border-[var(--muted-foreground)]/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
                Work email
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
              <Label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 px-4 text-[15px] bg-[var(--background)] border-[var(--border)] rounded-xl transition-all duration-200 hover:border-[var(--muted-foreground)]/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                Must be at least 8 characters with a number and symbol
              </p>
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
                  Creating account...
                </span>
              ) : 'Create account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--card)] px-3 text-[var(--muted-foreground)]">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full h-12 text-[15px] font-medium text-[var(--foreground)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Sign in instead
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-8">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-[var(--primary)] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
