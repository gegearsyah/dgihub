'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StandardHeader from './StandardHeader';
import AppSidebar from './layout/AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * App Layout Wrapper
 * Provides consistent sidebar navigation across all authenticated pages
 */
export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show layout on login/register pages
  if (!mounted || !isAuthenticated || loading) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <StandardHeader />
        
        <main className="flex-1 p-6 lg:p-8 text-foreground">
          {children}
        </main>
      </div>
    </div>
  );
}

