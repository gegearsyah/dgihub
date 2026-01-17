'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api';

export default function ParticipantsPage() {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const { error: showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'MITRA') {
      router.push('/login');
      return;
    }

    if (courseId) {
      loadParticipants();
    }
  }, [isAuthenticated, user, courseId, router]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourseParticipants(courseId);
      if (response.success && response.data) {
        setParticipants(Array.isArray(response.data) ? response.data : []);
      } else {
        showError(response.message || 'Failed to load participants');
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
      showError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-gray-50'}`}>
      <nav className={`shadow-sm ${isDark ? 'bg-card border-b border-border' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/mitra/courses" className={`text-xl font-bold ${
                isDark ? 'text-foreground' : 'text-gray-900'
              }`}>
                ← Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-foreground' : 'text-gray-900'
          }`}>Course Participants</h1>
          <p className={isDark ? 'text-muted-foreground' : 'text-gray-600'}>
            Manage and track participant progress
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                isDark ? 'border-[#0EB0F9]' : 'border-[#0EB0F9]'
              } mx-auto`}></div>
              <p className="mt-4 text-muted-foreground">Loading participants...</p>
            </div>
          </div>
        ) : participants.length === 0 ? (
          <div className={`rounded-lg shadow-md p-8 text-center ${
            isDark ? 'bg-card border border-border' : 'bg-white border border-gray-200'
          }`}>
            <p className={isDark ? 'text-muted-foreground' : 'text-gray-600'}>
              No participants enrolled in this course yet.
            </p>
          </div>
        ) : (

        <div className={`rounded-lg shadow-md overflow-hidden border ${
          isDark ? 'bg-card border-border' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-border' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${
                isDark ? 'text-foreground' : 'text-gray-900'
              }`}>All Participants ({participants.length})</h2>
              <div className="flex space-x-2">
                <button className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  isDark
                    ? 'border-border text-foreground hover:bg-muted'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  Export CSV
                </button>
                <button className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  isDark 
                    ? 'bg-[#0EB0F9] text-white hover:bg-[#0A9DE6]' 
                    : 'bg-[#0EB0F9] text-white hover:bg-[#0A9DE6]'
                }`}>
                  Send Message
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? 'bg-muted' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Participant
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Enrolled
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Progress
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Last Accessed
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? 'bg-card divide-border' : 'bg-white divide-gray-200'
              }`}>
                {participants.map((participant) => (
                  <tr 
                    key={participant.enrollment_id} 
                    className={isDark ? 'hover:bg-muted/50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${
                          isDark ? 'text-foreground' : 'text-gray-900'
                        }`}>{participant.full_name}</div>
                        <div className={`text-sm ${
                          isDark ? 'text-muted-foreground' : 'text-gray-500'
                        }`}>{participant.email}</div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      {new Date(participant.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-32 rounded-full h-2 mr-2 ${
                          isDark ? 'bg-muted' : 'bg-gray-200'
                        }`}>
                          <div
                            className={`h-2 rounded-full ${
                              isDark ? 'bg-[#0EB0F9]' : 'bg-[#0EB0F9]'
                            }`}
                            style={{ width: `${participant.progress}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm ${
                          isDark ? 'text-foreground' : 'text-gray-700'
                        }`}>{participant.progress}%</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      {new Date(participant.last_accessed_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        participant.status === 'ENROLLED' 
                          ? isDark
                            ? 'bg-[#0EB0F9]/20 text-[#3BC0FF] border border-[#0EB0F9]/30'
                            : 'bg-[#0EB0F9]/10 text-[#0878B3] border border-[#0EB0F9]/30'
                          : participant.status === 'COMPLETED'
                            ? isDark
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-green-100 text-green-800'
                            : isDark
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className={`mr-4 ${
                        isDark ? 'text-[#0EB0F9] hover:text-[#3BC0FF]' : 'text-[#0EB0F9] hover:text-[#0A9DE6]'
                      }`}>
                        View Details
                      </button>
                      {participant.progress >= 100 && (
                        <button className={isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}>
                          Issue Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}



