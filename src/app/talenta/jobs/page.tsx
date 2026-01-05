'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function JobSearchPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: ''
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'TALENTA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'TALENTA') {
      // For Talenta, we'll need a public job search endpoint or use a different approach
      // For now, show a message that they can browse available jobs
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Try to load jobs from industri endpoint (public jobs)
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'TALENTA') {
      loadJobs();
    }
  }, [isAuthenticated, filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Use the job postings endpoint to get available jobs
      const response = await apiClient.getJobPostings();
      if (response.success && response.data) {
        const data = response.data as any;
        setJobs(Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []));
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
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
          Job Search
        </h1>

        {/* Search and Filters */}
        <div className={`rounded-lg shadow p-6 mb-8 ${
          isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={`px-4 py-2 rounded-lg ${
                isDark
                  ? 'bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD] placeholder-[#6b7280]'
                  : 'border border-gray-300'
              }`}
            />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className={`px-4 py-2 rounded-lg ${
                isDark
                  ? 'bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD] placeholder-[#6b7280]'
                  : 'border border-gray-300'
              }`}
            />
            <select
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              className={`px-4 py-2 rounded-lg ${
                isDark
                  ? 'bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD]'
                  : 'border border-gray-300'
              }`}
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className={`rounded-lg shadow p-8 text-center ${
            isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
          }`}>
            <p className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>
              No jobs found. Try adjusting your search filters.
            </p>
            <div className="mt-4">
              <Link
                href="/talenta/courses"
                className="inline-block px-6 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: any) => (
              <div key={job.lowongan_id} className={`rounded-lg shadow-md overflow-hidden ${
                isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
              }`}>
                <div className="p-6">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                  }`}>
                    {job.job_title}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                  }`}>
                    {job.company_name}
                  </p>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Location:</span>
                      <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>{job.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Type:</span>
                      <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>{job.job_type}</span>
                    </div>
                    {job.salary_min && job.salary_max && (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Salary:</span>
                        <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>
                          Rp {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/industri/jobs/${job.lowongan_id}`}
                    className="block w-full text-center px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
                  >
                    View Details
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


