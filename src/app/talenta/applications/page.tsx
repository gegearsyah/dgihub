'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function ApplicationsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'TALENTA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'TALENTA') {
      loadApplications();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyApplications();
      if (response.success && response.data) {
        setApplications(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
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
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
          }`}>
            My Job Applications
          </h1>
          <p className={`mt-2 ${
            isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
          }`}>
            Track your job applications and their status
          </p>
        </div>

        {applications.length === 0 ? (
          <div className={`rounded-lg shadow p-8 text-center ${
            isDark ? 'bg-[#1B263B]' : 'bg-white'
          }`}>
            <p className={`mb-4 ${
              isDark ? 'text-[#C5C6C0]' : 'text-gray-500'
            }`}>
              You haven't applied to any jobs yet.
            </p>
            <Link
              href="/talenta/jobs"
              className="inline-block px-6 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.pelamar_id} className={`rounded-lg shadow-md p-6 ${
                isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-xl font-semibold ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {application.job_title}
                    </h3>
                    <p className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>
                      {application.company_name}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-[#6b7280]' : 'text-gray-500'
                    }`}>
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      application.status === 'PENDING'
                        ? isDark
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-yellow-100 text-yellow-800'
                        : application.status === 'ACCEPTED'
                        ? isDark
                          ? 'bg-[#2D6A4F]/20 text-[#2D6A4F]'
                          : 'bg-green-100 text-green-800'
                        : application.status === 'REJECTED'
                        ? isDark
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-red-100 text-red-800'
                        : isDark
                        ? 'bg-[#415A77] text-[#C5C6C0]'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status}
                    </span>
                    {application.hiring_decision && (
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        application.hiring_decision === 'ACCEPT'
                          ? isDark
                            ? 'bg-[#2D6A4F]/20 text-[#2D6A4F]'
                            : 'bg-green-100 text-green-800'
                          : isDark
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {application.hiring_decision}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Location:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {application.location}
                    </span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Job Type:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {application.job_type}
                    </span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Salary Range:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      Rp {application.salary_min?.toLocaleString() || '0'} - {application.salary_max?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {application.cover_letter && (
                  <div className="mb-4">
                    <p className={`text-sm font-medium mb-1 ${
                      isDark ? 'text-[#C5C6C0]' : 'text-gray-700'
                    }`}>
                      Your Cover Letter:
                    </p>
                    <p className={`text-sm p-3 rounded ${
                      isDark
                        ? 'bg-[#0D1B2A] text-[#C5C6C0]'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {application.cover_letter}
                    </p>
                  </div>
                )}

                {application.hiring_decision_notes && (
                  <div className="mb-4">
                    <p className={`text-sm font-medium mb-1 ${
                      isDark ? 'text-[#C5C6C0]' : 'text-gray-700'
                    }`}>
                      Employer Notes:
                    </p>
                    <p className={`text-sm p-3 rounded ${
                      isDark
                        ? 'bg-[#0D1B2A] text-[#C5C6C0]'
                        : 'bg-blue-50 text-gray-600'
                    }`}>
                      {application.hiring_decision_notes}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    href={`/industri/jobs/${application.lowongan_id}`}
                    className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target text-sm"
                  >
                    View Job Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

