'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

interface Enrollment {
  enrollment_id: string;
  enrolled_at: string;
  status: string;
  progress: number;
  completed_at: string | null;
  certificate_issued: boolean;
  kursus_id: string;
  title: string;
  description: string;
  duration_hours: number;
  skkni_code: string;
  aqrf_level: number;
  provider_name: string;
}

export default function MyCoursesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCourses();
    }
  }, [isAuthenticated]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyCourses();
      if (response.success && response.data) {
        setEnrollments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
          My Courses
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.enrollment_id} className={`rounded-lg shadow-md overflow-hidden ${
              isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-xl font-semibold ${
                    isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                  }`}>
                    {enrollment.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    enrollment.status === 'COMPLETED'
                      ? isDark
                        ? 'bg-[#2D6A4F]/20 text-[#2D6A4F]'
                        : 'bg-green-100 text-green-800'
                      : enrollment.status === 'ACTIVE'
                      ? isDark
                        ? 'bg-[#415A77] text-[#E0E1DD]'
                        : 'bg-blue-100 text-blue-800'
                      : isDark
                      ? 'bg-[#415A77] text-[#C5C6C0]'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>

                <p className={`text-sm mb-4 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                }`}>
                  {enrollment.provider_name}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Progress</span>
                    <span className={`font-semibold ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${
                    isDark ? 'bg-[#0D1B2A]' : 'bg-gray-200'
                  }`}>
                    <div
                      className="bg-[#2D6A4F] h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Enrolled:</span>
                    <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                  {enrollment.completed_at && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Completed:</span>
                      <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>
                        {new Date(enrollment.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {enrollment.certificate_issued && (
                    <div className={`flex items-center ${
                      isDark ? 'text-[#2D6A4F]' : 'text-green-600'
                    }`}>
                      <span className="mr-2">✓</span>
                      <span>Certificate Issued</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/talenta/courses/${enrollment.kursus_id}`}
                  className="block w-full text-center px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
                >
                  {enrollment.status === 'COMPLETED' ? 'View Certificate' : 'Continue Learning'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {enrollments.length === 0 && !loading && (
          <div className={`text-center py-12 rounded-lg ${
            isDark ? 'bg-[#1B263B]' : 'bg-white'
          }`}>
            <p className={`mb-4 ${
              isDark ? 'text-[#C5C6C0]' : 'text-gray-500'
            }`}>
              You haven't enrolled in any courses yet.
            </p>
            <Link
              href="/talenta/courses"
              className="inline-block px-6 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}




