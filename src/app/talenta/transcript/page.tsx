'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import CertificateCard from '@/components/CertificateCard';
import StatusBadge from '@/components/StatusBadge';
import AppLayout from '@/components/AppLayout';

export default function TranscriptPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [transcript, setTranscript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'TALENTA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'TALENTA') {
      loadTranscript();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadTranscript = async () => {
    try {
      setLoading(true);
      const [coursesResponse, certificatesResponse] = await Promise.all([
        apiClient.getMyCourses(),
        apiClient.getCertificates()
      ]);

      const enrollments = coursesResponse.success && coursesResponse.data 
        ? (Array.isArray(coursesResponse.data) ? coursesResponse.data : [])
        : [];
      const certificates = certificatesResponse.success && certificatesResponse.data
        ? (Array.isArray(certificatesResponse.data) ? certificatesResponse.data : [])
        : [];

      // Calculate statistics
      const totalCourses = enrollments.length;
      const completedCourses = enrollments.filter((e: any) => e.status === 'COMPLETED').length;
      const totalCertificates = certificates.length;
      const totalHours = enrollments.reduce((sum: number, e: any) => sum + (e.duration_hours || 0), 0);
      const avgProgress = totalCourses > 0 
        ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / totalCourses)
        : 0;

      setTranscript({
        enrollments,
        certificates,
        stats: {
          totalCourses,
          completedCourses,
          totalCertificates,
          totalHours,
          avgProgress
        }
      });
    } catch (error) {
      console.error('Failed to load transcript:', error);
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
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
          }`}>
            Learning Transcript
          </h1>
          <p className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>
            Your complete learning history and achievements
          </p>
        </div>

        {transcript && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className={`rounded-lg p-6 ${
                isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                }`}>
                  Total Courses
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                }`}>
                  {transcript.stats.totalCourses}
                </p>
              </div>
              <div className={`rounded-lg p-6 ${
                isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                }`}>
                  Completed
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-[#2D6A4F]' : 'text-[#2D6A4F]'
                }`}>
                  {transcript.stats.completedCourses}
                </p>
              </div>
              <div className={`rounded-lg p-6 ${
                isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                }`}>
                  Certificates
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {transcript.stats.totalCertificates}
                </p>
              </div>
              <div className={`rounded-lg p-6 ${
                isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                }`}>
                  Total Hours
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {transcript.stats.totalHours}
                </p>
              </div>
              <div className={`rounded-lg p-6 ${
                isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                }`}>
                  Avg Progress
                </p>
                <p className={`text-3xl font-bold ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {transcript.stats.avgProgress}%
                </p>
              </div>
            </div>

            {/* Course History */}
            <div className={`rounded-lg p-6 mb-8 ${
              isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
              }`}>
                Course History
              </h2>
              <div className="space-y-4">
                {transcript.enrollments.length === 0 ? (
                  <p className={`text-center py-8 ${
                    isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                  }`}>
                    No courses enrolled yet
                  </p>
                ) : (
                  transcript.enrollments.map((enrollment: any) => (
                    <div key={enrollment.enrollment_id} className={`rounded-lg p-4 ${
                      isDark ? 'bg-[#0D1B2A] border border-[#415A77]' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className={`font-medium mb-1 ${
                            isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                          }`}>
                            {enrollment.title}
                          </h3>
                          <p className={`text-sm ${
                            isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                          }`}>
                            {enrollment.provider_name}
                          </p>
                          {enrollment.skkni_code && (
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-[#6b7280]' : 'text-gray-500'
                            }`}>
                              SKKNI: {enrollment.skkni_code}
                            </p>
                          )}
                        </div>
                        <StatusBadge 
                          status={enrollment.status === 'COMPLETED' ? 'ACTIVE' : enrollment.status === 'ACTIVE' ? 'PENDING' : 'INACTIVE'} 
                        />
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>Progress</span>
                          <span className={`font-medium ${
                            isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                          }`}>
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-2 ${
                          isDark ? 'bg-[#0D1B2A]' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="bg-[#2D6A4F] h-2 rounded-full transition-all"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className={`flex items-center justify-between text-sm ${
                        isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                      }`}>
                        <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString('id-ID')}</span>
                        {enrollment.completed_at && (
                          <span>Completed: {new Date(enrollment.completed_at).toLocaleDateString('id-ID')}</span>
                        )}
                        {enrollment.certificate_issued && (
                          <span className={isDark ? 'text-[#2D6A4F]' : 'text-green-600'}>
                            ✓ Certificate Issued
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certificates */}
            <div className={`rounded-lg p-6 ${
              isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
              }`}>
                Certificates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transcript.certificates.length === 0 ? (
                  <p className={`col-span-2 text-center py-8 ${
                    isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                  }`}>
                    No certificates yet
                  </p>
                ) : (
                  transcript.certificates.map((cert: any) => (
                    <CertificateCard
                      key={cert.sertifikat_id}
                      certificateId={cert.sertifikat_id}
                      title={cert.title}
                      certificateNumber={cert.certificate_number}
                      skkniCode={cert.skkni_code}
                      aqrfLevel={cert.aqrf_level}
                      issuerName={cert.issuer_name}
                      issuedDate={cert.issued_date}
                      status={cert.status}
                      courseTitle={cert.course_title}
                    />
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


