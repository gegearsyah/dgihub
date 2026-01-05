'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function IndustriAnalyticsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'INDUSTRI')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'INDUSTRI') {
      loadAnalytics();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const jobsResponse = await apiClient.getJobPostings();
      if (jobsResponse.success && jobsResponse.data) {
        const jobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
        
        const totalJobs = jobs.length;
        const publishedJobs = jobs.filter((j: any) => j.status === 'PUBLISHED').length;
        const totalApplications = jobs.reduce((sum: number, j: any) => sum + (j.application_count || 0), 0);
        const pendingApplications = jobs.reduce((sum: number, j: any) => sum + (j.pending_count || 0), 0);
        const acceptedApplications = jobs.reduce((sum: number, j: any) => sum + (j.accepted_count || 0), 0);
        const avgApplications = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;
        const hireRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

        setAnalytics({
          totalJobs,
          publishedJobs,
          totalApplications,
          pendingApplications,
          acceptedApplications,
          avgApplications,
          hireRate,
          topJobs: jobs.slice(0, 5)
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
                    <p className="text-sm text-gray-400 mb-1">Total Job Postings</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  {analytics.publishedJobs} published
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalApplications}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Avg: {analytics.avgApplications} per job
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Pending Reviews</p>
                    <p className="text-3xl font-bold text-yellow-400">{analytics.pendingApplications}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Awaiting decision
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Hire Rate</p>
                    <p className="text-3xl font-bold text-green-400">{analytics.hireRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  {analytics.acceptedApplications} hired
                </div>
              </div>
            </div>

            {/* Top Jobs */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Top Job Postings</h2>
              <div className="space-y-4">
                {analytics.topJobs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No job postings yet</p>
                ) : (
                  analytics.topJobs.map((job: any) => (
                    <div key={job.lowongan_id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{job.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {job.application_count || 0} applications • {job.pending_count || 0} pending • {job.accepted_count || 0} accepted
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          job.status === 'PUBLISHED' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {job.status}
                        </span>
                        <Link
                          href={`/industri/jobs/${job.lowongan_id}/applicants`}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                        >
                          View Applicants
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


