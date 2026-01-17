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
            isDark ? 'border-[#0EB0F9]' : 'border-[#0EB0F9]'
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
              <div className={`rounded-lg p-6 border ${
                isDark 
                  ? 'bg-card border-border' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>Total Courses</p>
                    <p className={`text-3xl font-bold ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>{analytics.totalCourses}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'
                  }`}>
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
                <div className={`mt-4 flex items-center text-sm ${
                  isDark ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  <span className={isDark ? 'text-green-400' : 'text-green-600'}>
                    {analytics.publishedCourses} published
                  </span>
                  <span className={`mx-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                  <span className={isDark ? 'text-muted-foreground' : 'text-gray-500'}>
                    {analytics.draftCourses} draft
                  </span>
                </div>
              </div>

              <div className={`rounded-lg p-6 border ${
                isDark 
                  ? 'bg-card border-border' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>Total Enrollments</p>
                    <p className={`text-3xl font-bold ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>{analytics.totalEnrollments}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className={`mt-4 text-sm ${
                  isDark ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  Avg: {analytics.avgEnrollments} per course
                </div>
              </div>

              <div className={`rounded-lg p-6 border ${
                isDark 
                  ? 'bg-card border-border' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>Total Materials</p>
                    <p className={`text-3xl font-bold ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>{analytics.totalMaterials}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <span className="text-2xl">📄</span>
                  </div>
                </div>
                <div className={`mt-4 text-sm ${
                  isDark ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  Learning resources
                </div>
              </div>

              <div className={`rounded-lg p-6 border ${
                isDark 
                  ? 'bg-card border-border' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>Estimated Revenue</p>
                    <p className={`text-3xl font-bold ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      Rp {analytics.totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
                  }`}>
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className={`mt-4 text-sm ${
                  isDark ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  From enrollments
                </div>
              </div>
            </div>

            {/* Top Courses */}
            <div className={`rounded-lg p-6 border ${
              isDark 
                ? 'bg-card border-border' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDark ? 'text-foreground' : 'text-gray-900'
              }`}>Top Performing Courses</h2>
              <div className="space-y-4">
                {analytics.courses.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className={isDark ? 'text-muted-foreground' : 'text-gray-500'}>
                      No courses yet
                    </p>
                  </div>
                ) : (
                  analytics.courses.map((course: any) => (
                    <div 
                      key={course.kursus_id || `course-${course.title}`}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isDark 
                          ? 'bg-muted/50 border-border' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          isDark ? 'text-foreground' : 'text-gray-900'
                        }`}>{course.title}</h3>
                        <p className={`text-sm mt-1 ${
                          isDark ? 'text-muted-foreground' : 'text-gray-600'
                        }`}>
                          {course.enrollment_count || 0} enrollments • {course.material_count || 0} materials
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs rounded-full border ${
                          course.status === 'PUBLISHED' 
                            ? isDark
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-green-100 text-green-700 border-green-300'
                            : isDark
                              ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}>
                          {course.status}
                        </span>
                        <Link
                          href={`/mitra/courses/${course.kursus_id}/participants`}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            isDark
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
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


