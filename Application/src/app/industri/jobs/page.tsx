'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function JobsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    requirements: {
      certificates: [] as string[],
      skills: [] as string[],
      minExperience: ''
    }
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'INDUSTRI')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'INDUSTRI') {
      loadJobs();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJobPostings();
      if (response.success && response.data) {
        setJobs(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsInput = (document.getElementById('skills') as HTMLInputElement)?.value || '';
      const skkniInput = (document.getElementById('skkniCodes') as HTMLInputElement)?.value || '';
      
      const response = await apiClient.createJobPosting({
        title: formData.title,
        description: formData.description,
        jobType: 'FULL_TIME',
        location: formData.location,
        city: formData.location.split(',')[0] || formData.location,
        province: formData.location.split(',')[1]?.trim() || 'DKI Jakarta',
        salaryMin: parseInt(formData.salaryMin) || 0,
        salaryMax: parseInt(formData.salaryMax) || 0,
        requirements: {
          skills: skillsInput ? skillsInput.split(',').map(s => s.trim()) : [],
          skkniCodes: skkniInput ? skkniInput.split(',').map(s => s.trim()) : [],
          minExperience: parseInt(formData.requirements.minExperience) || 0
        }
      });

      if (response.success) {
        alert('Job posting created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          location: '',
          salaryMin: '',
          salaryMax: '',
          requirements: { certificates: [], skills: [], minExperience: '' }
        });
        loadJobs();
      } else {
        alert(response.message || 'Failed to create job posting');
      }
    } catch (error) {
      alert('Failed to create job posting');
    }
  };

  if (authLoading || loading) {
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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            Job Postings
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {showCreateForm ? 'Cancel' : '+ Create Job Posting'}
          </button>
        </div>

        {showCreateForm && (
          <div className="rounded-lg shadow-md p-6 bg-card border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Create Job Posting
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Min Salary (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Max Salary (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Required Skills (comma separated)
                </label>
                <input
                  id="skills"
                  type="text"
                  placeholder="e.g., JavaScript, React, Node.js"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Required SKKNI Codes (comma separated)
                </label>
                <input
                  id="skkniCodes"
                  type="text"
                  placeholder="e.g., SKKNI-IT-2023-001, SKKNI-IT-2023-002"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  value={formData.requirements.minExperience}
                  onChange={(e) => setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, minExperience: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Job Posting
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="rounded-lg shadow p-8 text-center max-w-md mx-auto bg-card border border-border">
                <p className="text-muted-foreground">
                  No job postings yet. Create your first job posting!
                </p>
              </div>
            </div>
          ) : (
            jobs.map((job, index) => (
              <div key={job.lowongan_id || `job-${index}`} className="rounded-lg shadow-md p-6 bg-card border border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1 text-foreground">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {job.location} • {job.city}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    job.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <p className="text-sm mb-4 line-clamp-2 text-muted-foreground">
                  {job.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="ml-2 font-medium text-foreground">
                      Rp {job.salary_min?.toLocaleString() || '0'} - {job.salary_max?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applicants:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {job.application_count || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {job.pending_count || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accepted:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {job.accepted_count || 0}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/industri/jobs/${job.lowongan_id}/applicants`}
                    className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    View Applicants ({job.application_count || 0})
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}


