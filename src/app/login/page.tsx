'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh(); // Force refresh to update auth state
        }, 100);
      } else {
        setError(result.message || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] px-4">
      {/* Language and Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full bg-[#1B263B] border border-[#415A77] rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#E0E1DD]">DGIHub Platform</h1>
          <p className="text-[#C5C6C0] mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#C5C6C0] mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] placeholder-[#6b7280]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#C5C6C0] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD] rounded-lg focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] placeholder-[#6b7280]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D6A4F] text-white py-2 px-4 rounded-lg hover:bg-[#2D6A4F]/80 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:ring-offset-2 focus:ring-offset-[#1B263B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#C5C6C0]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#2D6A4F] hover:text-[#2D6A4F]/80 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}



