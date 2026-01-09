'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingHeader from '@/components/layout/LandingHeader';
import LandingFooter from '@/components/layout/LandingFooter';
import HeroSection from '@/components/sections/HeroSection';
import PortalsSection from '@/components/sections/PortalsSection';
import CredentialShowcase from '@/components/sections/CredentialShowcase';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always show landing page - no redirect
  // Users can access dashboard via header navigation if logged in
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        <PortalsSection />
        <CredentialShowcase />
      </main>
      <LandingFooter />
    </div>
  );
}
