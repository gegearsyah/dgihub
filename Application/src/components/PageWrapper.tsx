'use client';

import { ReactNode } from 'react';
import AppLayout from './AppLayout';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
}

/**
 * Page Wrapper Component
 * Wraps page content with AppLayout and provides consistent styling
 */
export default function PageWrapper({ children, title }: PageWrapperProps) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {title}
            </h1>
          </div>
        )}
        {children}
      </div>
    </AppLayout>
  );
}

