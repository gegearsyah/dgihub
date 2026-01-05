'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A]">
      {/* Language and Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#E0E1DD] mb-4">
            DGIHub Platform
          </h1>
          <p className="text-xl text-[#C5C6C0] mb-2">
            Indonesia Vocational Training Platform
          </p>
          <p className="text-lg text-[#6b7280] mb-12 max-w-2xl mx-auto">
            Multi-tenant platform connecting Government, Training Partners (LPKs), and Employers
            to deliver verifiable credentials and skills certification.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="px-8 py-3 bg-[#2D6A4F] text-white rounded-lg font-semibold hover:bg-[#2D6A4F]/80 transition-colors shadow-lg touch-target"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-[#1B263B] text-[#2D6A4F] rounded-lg font-semibold hover:bg-[#1B263B]/80 transition-colors shadow-lg border-2 border-[#2D6A4F] touch-target"
            >
              Get Started
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-[#1B263B] border border-[#415A77] p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-[#E0E1DD] mb-2">For Learners</h3>
              <p className="text-[#C5C6C0]">
                Access training programs, earn verifiable credentials, and showcase your skills to employers.
              </p>
            </div>
            <div className="bg-[#1B263B] border border-[#415A77] p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-[#E0E1DD] mb-2">For Training Partners</h3>
              <p className="text-[#C5C6C0]">
                Deliver courses, issue certificates, and manage your training programs efficiently.
              </p>
            </div>
            <div className="bg-[#1B263B] border border-[#415A77] p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-[#E0E1DD] mb-2">For Employers</h3>
              <p className="text-[#C5C6C0]">
                Discover skilled talent, verify credentials, and connect with qualified professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
