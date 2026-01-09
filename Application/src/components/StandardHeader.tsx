'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import Notifications from './Notifications';
import { ToastContainer } from './Toast';

export default function StandardHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { toasts, removeToast } = useToast();
  const t = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-lg border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16 gap-3">
            {/* Right side controls */}
            {mounted && (
              <>
                <LanguageToggle />
                <ThemeToggle />
                {isAuthenticated && (
                  <>
                    <Notifications />
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm rounded-lg transition-colors touch-target bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {t('common.logout')}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

