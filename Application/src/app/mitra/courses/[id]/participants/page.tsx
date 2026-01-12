'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockParticipants } from '@/lib/mockData';

export default function ParticipantsPage() {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [participants, setParticipants] = useState(mockParticipants);
  const isDark = theme === 'dark';

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
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
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
                            className="bg-indigo-600 h-2 rounded-full"
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
                        participant.status === 'ACTIVE' 
                          ? isDark
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-green-100 text-green-800'
                          : participant.status === 'COMPLETED'
                            ? isDark
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-blue-100 text-blue-800'
                            : isDark
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        View Details
                      </button>
                      {participant.progress >= 100 && (
                        <button className="text-green-600 hover:text-green-900">
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
      </main>
    </div>
  );
}



