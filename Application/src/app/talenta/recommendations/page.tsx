'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function RecommendationsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'TALENTA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'TALENTA') {
      loadRecommendations();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // Get user's courses to find similar ones
      const coursesResponse = await apiClient.getCourses();
      if (coursesResponse.success && coursesResponse.data) {
        // Mock recommendation logic - would use ML in production
        const data = coursesResponse.data as any;
        const courses = Array.isArray(data?.courses) ? data.courses : (Array.isArray(data) ? data : []);
        // Sort by relevance (mock: prioritize courses with SKKNI codes)
        const recommended = courses
          .filter((c: any) => !c.is_enrolled)
          .sort((a: any, b: any) => {
            const scoreA = (a.skkni_code ? 10 : 0) + (a.aqrf_level || 0);
            const scoreB = (b.skkni_code ? 10 : 0) + (b.aqrf_level || 0);
            return scoreB - scoreA;
          })
          .slice(0, 12);
        
        setRecommendations(recommended);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div           className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? 'border-[#0EB0F9]' : 'border-[#0EB0F9]'
          }`}></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
          }`}>
            Recommended for You
          </h1>
          <p className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>
            Courses tailored to your skills and interests
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className={`rounded-lg p-12 text-center ${
            isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
          }`}>
            <p className={`mb-4 ${
              isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
            }`}>
              No recommendations available yet
            </p>
            <Link
              href="/talenta/courses"
              className="inline-block px-6 py-2 bg-[#0EB0F9] hover:bg-[#0A9DE6] text-white rounded-lg transition-colors touch-target"
            >
              Browse All Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((course: any) => (
              <div key={course.kursus_id} className={`rounded-lg overflow-hidden transition-colors ${
                isDark
                  ? 'bg-[#1B263B] border border-[#415A77] hover:border-[#0EB0F9]'
                  : 'bg-white border border-gray-200 hover:border-[#0EB0F9]'
              }`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-lg font-semibold line-clamp-2 ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {course.title}
                    </h3>
                    {course.skkni_code && (
                      <span className={`px-2 py-1 rounded text-xs border whitespace-nowrap ml-2 ${
                        isDark
                          ? 'bg-[#0EB0F9]/20 text-[#3BC0FF] border-[#0EB0F9]/30'
                          : 'bg-[#0EB0F9]/10 text-[#0878B3] border-[#0EB0F9]/30'
                      }`}>
                        SKKNI
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-3 ${
                    isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                  }`}>
                    {course.provider_name}
                  </p>
                  <p className={`text-sm line-clamp-2 mb-4 ${
                    isDark ? 'text-[#6b7280]' : 'text-gray-500'
                  }`}>
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>
                      Duration: {course.duration_hours}h
                    </span>
                    {course.aqrf_level && (
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>
                        AQRF {course.aqrf_level}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {course.price > 0 ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Free'}
                    </span>
                    <Link
                      href={`/talenta/courses/${course.kursus_id}`}
                      className="px-4 py-2 bg-[#0EB0F9] hover:bg-[#0A9DE6] text-white rounded-lg text-sm transition-colors touch-target"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}


