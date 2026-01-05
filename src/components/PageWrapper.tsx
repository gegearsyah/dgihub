'use client';

import { ReactNode } from 'react';
import AppLayout from './AppLayout';
import { useTheme } from '@/contexts/ThemeContext';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
}

/**
 * Page Wrapper Component
 * Wraps page content with AppLayout and provides consistent styling
 */
export default function PageWrapper({ children, title, showBottomNav = true }: PageWrapperProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AppLayout showBottomNav={showBottomNav}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
            }`}>
              {title}
            </h1>
          </div>
        )}
        {children}
      </div>
    </AppLayout>
  );
}

