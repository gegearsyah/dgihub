'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import Notifications from './Notifications';
import { ToastContainer } from './Toast';

export default function StandardHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { toasts, removeToast } = useToast();
  const t = useTranslation();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isDark = theme === 'dark';

  return (
    <>
      <header className={`sticky top-0 z-50 border-b ${
        isDark 
          ? 'bg-[#0D1B2A] border-[#415A77]' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <h1 className={`text-xl font-bold ${
                  isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                }`}>
                  DGIHub
                </h1>
              </Link>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Language and Theme Toggle - Always visible */}
              <LanguageToggle />
              <ThemeToggle />
              
              {isAuthenticated && (
                <>
                  <Notifications />
                  <div className={`text-sm ${
                    isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                  }`}>
                    {user?.fullName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors touch-target ${
                      isDark
                        ? 'bg-[#2D6A4F] text-white hover:bg-[#2D6A4F]/80'
                        : 'bg-[#2D6A4F] text-white hover:bg-[#2D6A4F]/80'
                    }`}
                  >
                    {t('common.logout')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

