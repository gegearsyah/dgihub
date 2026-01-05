'use client';

import { useRouter, usePathname } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';

type NavigationItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  userTypes: ('TALENTA' | 'MITRA' | 'INDUSTRI')[];
};

/**
 * Standardized Bottom Navigation Component
 * Mobile-first, thumb-zone optimized (lower 1/3 of screen)
 * Maximum 5 items, role-based navigation
 */
export default function StandardBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, language } = useTheme();
  const t = useTranslation();
  const userType = user?.userType as 'TALENTA' | 'MITRA' | 'INDUSTRI' | undefined;
  const isDark = theme === 'dark';

  // Role-based navigation items - Maximum 5 items for mobile-first design
  const talentaNav: NavigationItem[] = [
    { label: t('nav.home'), icon: <HomeIcon />, path: '/dashboard', userTypes: ['TALENTA'] },
    { label: t('nav.courses'), icon: <SchoolIcon />, path: '/talenta/courses', userTypes: ['TALENTA'] },
    { label: t('nav.myCourses'), icon: <AssignmentIcon />, path: '/talenta/my-courses', userTypes: ['TALENTA'] },
    { label: t('nav.wallet'), icon: <AccountBalanceWalletIcon />, path: '/talenta/certificates', userTypes: ['TALENTA'] },
    { label: t('nav.profile'), icon: <PersonIcon />, path: '/profile', userTypes: ['TALENTA'] },
  ];

  const mitraNav: NavigationItem[] = [
    { label: t('nav.home'), icon: <HomeIcon />, path: '/dashboard', userTypes: ['MITRA'] },
    { label: t('nav.courses'), icon: <SchoolIcon />, path: '/mitra/courses', userTypes: ['MITRA'] },
    { label: t('nav.workshops'), icon: <WorkIcon />, path: '/mitra/workshops', userTypes: ['MITRA'] },
    { label: t('nav.analytics'), icon: <AnalyticsIcon />, path: '/mitra/analytics', userTypes: ['MITRA'] },
    { label: t('nav.profile'), icon: <PersonIcon />, path: '/profile', userTypes: ['MITRA'] },
  ];

  const industriNav: NavigationItem[] = [
    { label: t('nav.home'), icon: <HomeIcon />, path: '/dashboard', userTypes: ['INDUSTRI'] },
    { label: t('nav.jobs'), icon: <WorkIcon />, path: '/industri/jobs', userTypes: ['INDUSTRI'] },
    { label: t('nav.search'), icon: <SearchIcon />, path: '/industri/search', userTypes: ['INDUSTRI'] },
    { label: t('nav.talentPool'), icon: <GroupIcon />, path: '/industri/talent-pool', userTypes: ['INDUSTRI'] },
    { label: t('nav.profile'), icon: <PersonIcon />, path: '/profile', userTypes: ['INDUSTRI'] },
  ];

  const getNavItems = (): NavigationItem[] => {
    switch (userType) {
      case 'TALENTA':
        return talentaNav;
      case 'MITRA':
        return mitraNav;
      case 'INDUSTRI':
        return industriNav;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Don't show navigation on login/register pages or if no user type
  const hideNavPages = ['/login', '/register', '/'];
  if (!userType || hideNavPages.includes(pathname || '')) {
    return null;
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bottom-nav-safe ${
        isDark
          ? 'bg-[#1B263B] border-t border-[#415A77]'
          : 'bg-white border-t border-gray-200 shadow-lg'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          // Better active state detection - check if current path starts with nav path
          const isActive = pathname === item.path || 
            (pathname?.startsWith(item.path + '/') && item.path !== '/dashboard');
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 touch-target transition-colors ${
                isActive
                  ? isDark
                    ? 'text-[#2D6A4F]'
                    : 'text-[#2D6A4F]'
                  : isDark
                  ? 'text-[#C5C6C0] hover:text-[#E0E1DD]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={item.label}
            >
              <div className={isActive ? 'text-[#2D6A4F]' : ''}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D6A4F] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

