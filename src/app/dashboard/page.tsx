'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import AppLayout from '@/components/AppLayout';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, language } = useTheme();
  const router = useRouter();
  const t = useTranslation();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Debug: Log auth state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard auth state:', { isAuthenticated, loading, user: user?.email });
    }
  }, [isAuthenticated, loading, user]);

  // Prevent hydration mismatch by not rendering until client-side
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-[#0D1B2A]' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
            isDark ? 'border-[#2D6A4F]' : 'border-[#2D6A4F]'
          }`}></div>
          <p className={`mt-4 ${isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-lg shadow-lg p-6 ${
          isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${
            isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
          }`}>
            Welcome to DGIHub!
          </h2>
          
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${
              isDark
                ? 'bg-[#0D1B2A] border border-[#415A77]'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                isDark ? 'text-[#E0E1DD]' : 'text-blue-900'
              }`}>
                Account Information
              </h3>
              <div className={`space-y-2 text-sm ${
                isDark ? 'text-[#C5C6C0]' : 'text-gray-700'
              }`}>
                <p><span className="font-medium">Name:</span> {user.fullName}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">User Type:</span> {user.userType}</p>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              isDark
                ? 'bg-[#0D1B2A] border border-[#415A77]'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
              }`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {user.userType === 'TALENTA' && (
                  <>
                    <Link href="/talenta/recommendations" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        {t('dashboard.recommendedCourses')}
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        {language === 'id' ? 'Saran kursus yang dipersonalisasi' : 'Personalized course suggestions'}
                      </p>
                    </Link>
                    <Link href="/talenta/courses" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        {t('dashboard.browseCourses')}
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        {language === 'id' ? 'Jelajahi program pelatihan yang tersedia' : 'Explore available training programs'}
                      </p>
                    </Link>
                    <Link href="/talenta/my-courses" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        My Courses
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        View your enrolled courses
                      </p>
                    </Link>
                    <Link href="/talenta/transcript" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Learning Transcript
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Complete learning history
                      </p>
                    </Link>
                    <Link href="/talenta/certificates" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Certificates
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        View your credentials
                      </p>
                    </Link>
                    <Link href="/talenta/applications" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        My Applications
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Track your job applications
                      </p>
                    </Link>
                  </>
                )}
                {user.userType === 'MITRA' && (
                  <>
                    <Link href="/mitra/analytics" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Analytics Dashboard
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        View course stats and metrics
                      </p>
                    </Link>
                    <Link href="/mitra/courses" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Manage Courses
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Create and manage training programs
                      </p>
                    </Link>
                    <Link href="/mitra/workshops" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Workshops
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Manage workshop sessions
                      </p>
                    </Link>
                    <Link href="/mitra/certificates/issue" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Issue Certificates
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Issue credentials to learners
                      </p>
                    </Link>
                  </>
                )}
                {user.userType === 'INDUSTRI' && (
                  <>
                    <Link href="/industri/analytics" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Analytics Dashboard
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        View hiring metrics and stats
                      </p>
                    </Link>
                    <Link href="/industri/search" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Search Talent
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Find qualified candidates
                      </p>
                    </Link>
                    <Link href="/industri/jobs" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Job Postings
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Manage job openings
                      </p>
                    </Link>
                    <Link href="/industri/talent-pool" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Talent Pool
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Manage saved candidates
                      </p>
                    </Link>
                    <Link href="/industri/saved-searches" className={`p-4 rounded border hover:shadow-md transition-shadow block ${
                      isDark
                        ? 'bg-[#1B263B] border-[#415A77] hover:border-[#2D6A4F]'
                        : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        Saved Searches
                      </h4>
                      <p className={`text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        Quick access to search filters
                      </p>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              isDark
                ? 'bg-[#fbbf24]/20 border border-[#fbbf24]'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-sm ${
                isDark ? 'text-[#fbbf24]' : 'text-yellow-800'
              }`}>
                <strong>Note:</strong> This is a basic dashboard. More features will be available as the platform develops.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

