'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          My Courses
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment, index) => (
            <div key={enrollment.enrollment_id || enrollment.kursus_id || `enrollment-${index}`} className="rounded-lg shadow-md overflow-hidden bg-card border border-border">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {enrollment.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    enrollment.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : enrollment.status === 'ACTIVE'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>

                <p className="text-sm mb-4 text-muted-foreground">
                  {enrollment.provider_name}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 bg-muted">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="text-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                  {enrollment.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="text-foreground">
                        {new Date(enrollment.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {enrollment.certificate_issued && (
                    <div className="flex items-center text-primary">
                      <span className="mr-2">✓</span>
                      <span>Certificate Issued</span>
                    </div>
                  )}
                </div>

                <Link
                  href={enrollment.kursus_id 
                    ? (enrollment.status === 'COMPLETED' 
                      ? `/talenta/certificates` 
                      : `/talenta/courses/${enrollment.kursus_id}/learn`)
                    : '/talenta/courses'}
                  className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-target"
                >
                  {enrollment.status === 'COMPLETED' ? 'View Certificate' : 'Continue Learning'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {enrollments.length === 0 && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center py-12 px-8 rounded-lg max-w-md mx-auto bg-card border border-border">
              <p className="mb-4 text-muted-foreground">
                You haven't enrolled in any courses yet.
              </p>
              <Link
                href="/talenta/courses"
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-target"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}




