'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function MitraAnalyticsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'MITRA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'MITRA') {
      loadAnalytics();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch courses to calculate analytics
      const coursesResponse = await apiClient.getMitraCourses();
      if (coursesResponse.success && coursesResponse.data) {
        const courses = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
        
        // Calculate analytics
        const totalCourses = courses.length;
        const publishedCourses = courses.filter((c: any) => c.status === 'PUBLISHED').length;
        const totalEnrollments = courses.reduce((sum: number, c: any) => sum + (c.enrollment_count || 0), 0);
        const totalMaterials = courses.reduce((sum: number, c: any) => sum + (c.material_count || 0), 0);
        const avgEnrollments = totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0;
        
        // Calculate revenue (mock - would need payment data)
        const totalRevenue = courses.reduce((sum: number, c: any) => {
          return sum + ((c.price || 0) * (c.enrollment_count || 0));
        }, 0);

        setAnalytics({
          totalCourses,
          publishedCourses,
          draftCourses: totalCourses - publishedCourses,
          totalEnrollments,
          totalMaterials,
          avgEnrollments,
          totalRevenue,
          courses: courses.slice(0, 5) // Top 5 courses
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? 'border-[#2D6A4F]' : 'border-[#2D6A4F]'
          }`}></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-3xl font-bold mb-8 ${
          isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
        }`}>
          Analytics Dashboard
        </h1>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Courses</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalCourses}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-400">{analytics.publishedCourses} published</span>
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="text-gray-400">{analytics.draftCourses} draft</span>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Enrollments</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalEnrollments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Avg: {analytics.avgEnrollments} per course
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Materials</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalMaterials}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Learning resources
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Estimated Revenue</p>
                    <p className="text-3xl font-bold text-white">
                      Rp {analytics.totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  From enrollments
                </div>
              </div>
            </div>

            {/* Top Courses */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Top Performing Courses</h2>
              <div className="space-y-4">
                {analytics.courses.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No courses yet</p>
                ) : (
                  analytics.courses.map((course: any) => (
                    <div key={course.kursus_id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{course.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {course.enrollment_count || 0} enrollments • {course.material_count || 0} materials
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          course.status === 'PUBLISHED' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {course.status}
                        </span>
                        <Link
                          href={`/mitra/courses/${course.kursus_id}/participants`}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}


