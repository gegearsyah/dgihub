'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export default function ApplicantsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [decisionForm, setDecisionForm] = useState({
    decision: '',
    notes: '',
    saveToTalentPool: false
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'INDUSTRI')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'INDUSTRI' && jobId) {
      loadApplicants();
    }
  }, [isAuthenticated, authLoading, user, router, jobId]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getJobApplicants(jobId);
      if (response.success && response.data) {
        setApplicants(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (applicationId: string) => {
    if (!decisionForm.decision) {
      alert('Please select a decision');
      return;
    }

    try {
      const response = await apiClient.makeHiringDecision(applicationId, {
        decision: decisionForm.decision,
        notes: decisionForm.notes,
        saveToTalentPool: decisionForm.saveToTalentPool
      });

      if (response.success) {
        alert(`Application ${decisionForm.decision.toLowerCase()}ed successfully!`);
        setSelectedApplicant(null);
        setDecisionForm({ decision: '', notes: '', saveToTalentPool: false });
        loadApplicants();
      } else {
        alert(response.message || 'Failed to update decision');
      }
    } catch (error) {
      alert('Failed to update decision');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                DGIHub - Industri Portal
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/industri/jobs" className="text-sm text-gray-700 hover:text-indigo-600">
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/industri/jobs" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Job Postings
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Job Applicants</h1>
        </div>

        {applicants.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white rounded-lg shadow p-8 text-center max-w-md mx-auto text-gray-500">
              No applicants yet for this job posting.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div key={applicant.pelamar_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{applicant.full_name}</h3>
                    <p className="text-gray-600">{applicant.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied: {new Date(applicant.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      applicant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      applicant.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      applicant.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {applicant.status}
                    </span>
                    {applicant.hiring_decision && (
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        applicant.hiring_decision === 'ACCEPT' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {applicant.hiring_decision}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{applicant.city}, {applicant.province}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Certificates:</span>
                    <span className="ml-2 font-medium">{applicant.certificate_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">AQRF Level:</span>
                    <span className="ml-2 font-medium">{applicant.aqrf_level || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Skills:</span>
                    <span className="ml-2 font-medium">
                      {applicant.skills ? (
                        typeof applicant.skills === 'string' 
                          ? JSON.parse(applicant.skills).slice(0, 3).map((s: any) => s.name || s).join(', ')
                          : Array.isArray(applicant.skills)
                            ? applicant.skills.slice(0, 3).map((s: any) => s.name || s).join(', ')
                            : 'N/A'
                      ) : 'N/A'}
                    </span>
                  </div>
                </div>

                {applicant.cover_letter && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{applicant.cover_letter}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    href={`/industri/talenta/${applicant.talenta_id}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    View Full Profile
                  </Link>
                  {applicant.status === 'PENDING' && (
                    <button
                      onClick={() => setSelectedApplicant(applicant.pelamar_id)}
                      className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm"
                    >
                      Make Decision
                    </button>
                  )}
                </div>

                {selectedApplicant === applicant.pelamar_id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Hiring Decision</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                        <select
                          value={decisionForm.decision}
                          onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Decision</option>
                          <option value="ACCEPT">Accept</option>
                          <option value="REJECT">Reject</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={decisionForm.notes}
                          onChange={(e) => setDecisionForm({ ...decisionForm, notes: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          rows={3}
                          placeholder="Optional notes about the decision..."
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`save-${applicant.pelamar_id}`}
                          checked={decisionForm.saveToTalentPool}
                          onChange={(e) => setDecisionForm({ ...decisionForm, saveToTalentPool: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor={`save-${applicant.pelamar_id}`} className="text-sm text-gray-700">
                          Save to Talent Pool (if rejected)
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDecision(applicant.pelamar_id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                        >
                          Submit Decision
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplicant(null);
                            setDecisionForm({ decision: '', notes: '', saveToTalentPool: false });
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

