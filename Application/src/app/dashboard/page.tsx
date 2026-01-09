'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import AppLayout from '@/components/AppLayout';
import CertificateShowcase from '@/components/dashboard/CertificateShowcase';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const t = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, loading, router]);

  if (!mounted || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.welcome')}, {user.fullName.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcomeSubtitle')}
          </p>
        </div>

        {/* Combined Profile and Quick Actions */}
        <DashboardOverview user={user} />

        {/* Certificate Showcase for TALENTA users */}
        {user.userType === 'TALENTA' && (
          <div className="mt-8">
            <CertificateShowcase />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

