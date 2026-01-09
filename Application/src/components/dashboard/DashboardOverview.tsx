'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Briefcase, Sparkles, BookOpen, GraduationCap, FileText, Award, TrendingUp, Search, Users as UsersIcon, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardOverviewProps {
  user: {
    fullName: string;
    email: string;
    userType: string;
  };
}

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const t = useTranslation();
  const { language } = useTheme();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, { id: string; en: string }> = {
      TALENTA: { id: 'Pembelajar', en: 'Learner' },
      MITRA: { id: 'Penyedia Pelatihan', en: 'Training Provider' },
      INDUSTRI: { id: 'Pemberi Kerja', en: 'Employer' }
    };
    const label = labels[type] || { id: type, en: type };
    return language === 'en' ? label.en : label.id;
  };

  const talentaActions = [
    { href: '/talenta/recommendations', titleKey: 'dashboard.recommendedCourses', descKey: 'dashboard.recommendedCoursesDesc', icon: Sparkles },
    { href: '/talenta/courses', titleKey: 'dashboard.browseCourses', descKey: 'dashboard.browseCoursesDesc', icon: BookOpen },
    { href: '/talenta/my-courses', titleKey: 'dashboard.myCourses', descKey: 'dashboard.myCoursesDesc', icon: GraduationCap },
    { href: '/talenta/transcript', titleKey: 'dashboard.learningTranscript', descKey: 'dashboard.learningTranscriptDesc', icon: FileText },
    { href: '/talenta/certificates', titleKey: 'dashboard.certificates', descKey: 'dashboard.certificatesDesc', icon: Award },
    { href: '/talenta/applications', titleKey: 'dashboard.myApplications', descKey: 'dashboard.myApplicationsDesc', icon: Briefcase },
  ];

  const mitraActions = [
    { href: '/mitra/analytics', titleKey: 'dashboard.analyticsDashboard', descKey: 'dashboard.analyticsDashboardDesc', icon: TrendingUp },
    { href: '/mitra/courses', titleKey: 'dashboard.manageCourses', descKey: 'dashboard.manageCoursesDesc', icon: BookOpen },
    { href: '/mitra/workshops', titleKey: 'dashboard.manageWorkshops', descKey: 'dashboard.manageWorkshopsDesc', icon: GraduationCap },
    { href: '/mitra/certificates/issue', titleKey: 'dashboard.issueCertificates', descKey: 'dashboard.issueCertificatesDesc', icon: Award },
  ];

  const industriActions = [
    { href: '/industri/analytics', titleKey: 'dashboard.analyticsDashboard', descKey: 'dashboard.analyticsDashboardDesc', icon: TrendingUp },
    { href: '/industri/search', titleKey: 'dashboard.searchTalent', descKey: 'dashboard.searchTalentDesc', icon: Search },
    { href: '/industri/jobs', titleKey: 'dashboard.jobPostings', descKey: 'dashboard.jobPostingsDesc', icon: Briefcase },
    { href: '/industri/talent-pool', titleKey: 'dashboard.manageSavedCandidates', descKey: 'dashboard.manageSavedCandidatesDesc', icon: UsersIcon },
    { href: '/industri/saved-searches', titleKey: 'dashboard.savedSearches', descKey: 'dashboard.savedSearchesDesc', icon: ClipboardList },
  ];

  const actions = user.userType === 'TALENTA' ? talentaActions :
                  user.userType === 'MITRA' ? mitraActions :
                  industriActions;

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl mb-1">{user.fullName}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{getUserTypeLabel(user.userType)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('dashboard.quickActions')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('dashboard.quickActionsDesc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon as LucideIcon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group"
              >
                <div className={cn(
                  "p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all duration-200",
                  "group-hover:border-primary/50 group-hover:shadow-sm"
                )}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {t(action.titleKey)}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {t(action.descKey)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
