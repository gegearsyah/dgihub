'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Award, 
  Briefcase,
  TrendingUp,
  Search,
  Users,
  ClipboardList,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type NavigationItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  userTypes: ('TALENTA' | 'MITRA' | 'INDUSTRI')[];
};

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userType = user?.userType as 'TALENTA' | 'MITRA' | 'INDUSTRI' | undefined;

  // Role-based navigation items
  const talentaNav: NavigationItem[] = [
    { label: t('nav.home'), icon: Home, path: '/dashboard', userTypes: ['TALENTA'] },
    { label: t('nav.courses'), icon: BookOpen, path: '/talenta/courses', userTypes: ['TALENTA'] },
    { label: t('nav.myCourses'), icon: GraduationCap, path: '/talenta/my-courses', userTypes: ['TALENTA'] },
    { label: t('nav.wallet'), icon: Award, path: '/talenta/certificates', userTypes: ['TALENTA'] },
    { label: t('nav.profile'), icon: Users, path: '/profile', userTypes: ['TALENTA'] },
  ];

  const mitraNav: NavigationItem[] = [
    { label: t('nav.home'), icon: Home, path: '/dashboard', userTypes: ['MITRA'] },
    { label: t('nav.courses'), icon: BookOpen, path: '/mitra/courses', userTypes: ['MITRA'] },
    { label: t('nav.workshops'), icon: GraduationCap, path: '/mitra/workshops', userTypes: ['MITRA'] },
    { label: t('nav.analytics'), icon: TrendingUp, path: '/mitra/analytics', userTypes: ['MITRA'] },
    { label: t('nav.profile'), icon: Users, path: '/profile', userTypes: ['MITRA'] },
  ];

  const industriNav: NavigationItem[] = [
    { label: t('nav.home'), icon: Home, path: '/dashboard', userTypes: ['INDUSTRI'] },
    { label: t('nav.jobs'), icon: Briefcase, path: '/industri/jobs', userTypes: ['INDUSTRI'] },
    { label: t('nav.search'), icon: Search, path: '/industri/search', userTypes: ['INDUSTRI'] },
    { label: t('nav.talentPool'), icon: Users, path: '/industri/talent-pool', userTypes: ['INDUSTRI'] },
    { label: t('nav.profile'), icon: Users, path: '/profile', userTypes: ['INDUSTRI'] },
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
  if (!mounted || !userType || hideNavPages.includes(pathname || '')) {
    return null;
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isActive = (path: string) => {
    return pathname === path || (pathname?.startsWith(path + '/') && path !== '/dashboard');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-card border border-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and User Info */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground text-lg">DGIHub</h2>
              <p className="text-xs text-muted-foreground truncate">{user?.fullName}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    "hover:bg-muted/50",
                    active
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active ? "text-primary" : "group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "font-medium flex-1",
                    active && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                  {active && (
                    <ChevronRight className="h-4 w-4 text-primary animate-in slide-in-from-left-2" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {getInitials(user?.fullName || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
