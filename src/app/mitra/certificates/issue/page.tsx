'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockParticipants } from '@/lib/mockData';
import AppLayout from '@/components/AppLayout';

export default function IssueCertificatePage() {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    talentaId: '',
    kursusId: '',
    score: '',
    grade: '',
    aqrfLevel: ''
  });
  const [participants] = useState(mockParticipants);
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Certificate issued successfully!');
    router.push('/mitra/courses');
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-lg shadow-md p-8 ${
          isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
        }`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Issue Certificate</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Participant
              </label>
              <select
                required
                value={formData.talentaId}
                onChange={(e) => setFormData({ ...formData, talentaId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Choose a participant...</option>
                {participants.map((p) => (
                  <option key={p.enrollment_id} value={p.enrollment_id}>
                    {p.full_name} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <input
                type="text"
                required
                value={formData.kursusId}
                onChange={(e) => setFormData({ ...formData, kursusId: e.target.value })}
                placeholder="Course ID or select from enrolled courses"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Grade</option>
                  <option value="A">A (Excellent)</option>
                  <option value="B">B (Good)</option>
                  <option value="C">C (Satisfactory)</option>
                  <option value="D">D (Pass)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AQRF Level
              </label>
              <select
                value={formData.aqrfLevel}
                onChange={(e) => setFormData({ ...formData, aqrfLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select AQRF Level</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Certificate will be issued in Open Badges 3.0 format and
                will be verifiable on the blockchain. The participant will receive a notification
                once the certificate is issued.
              </p>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/mitra/courses"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Issue Certificate
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}



