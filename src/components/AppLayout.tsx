'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import StandardHeader from './StandardHeader';
import StandardBottomNavigation from './StandardBottomNavigation';

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

/**
 * App Layout Wrapper
 * Provides consistent header and bottom navigation across all authenticated pages
 */
export default function AppLayout({ children, showBottomNav = true }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Don't show layout on login/register pages
  if (!isAuthenticated || loading) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0D1B2A]' : 'bg-gray-50'}`}>
      <StandardHeader />
      
      <main className={`pb-24 ${isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}`}>
        {children}
      </main>

      {showBottomNav && <StandardBottomNavigation />}
    </div>
  );
}

