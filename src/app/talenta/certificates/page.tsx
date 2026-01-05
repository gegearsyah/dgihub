'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

interface Certificate {
  sertifikat_id: string;
  certificate_number: string;
  credential_id: string;
  title: string;
  issued_date: string;
  expiration_date: string | null;
  skkni_code: string | null;
  aqrf_level: number | null;
  status: string;
  course_title: string | null;
  issuer_name: string;
}

export default function CertificatesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCertificates();
    }
  }, [isAuthenticated]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCertificates();
      if (response.success && response.data) {
        setCertificates(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
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
            My Certificates
          </h1>
          <p className={isDark ? 'text-[#C5C6C0]' : 'text-gray-600'}>
            Your lifelong learning passport - verifiable credentials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.sertifikat_id} className={`rounded-lg shadow-md overflow-hidden ${
              isDark
                ? 'bg-[#1B263B] border-2 border-[#2D6A4F]/30'
                : 'bg-white border-2 border-indigo-100'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {cert.title}
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                    }`}>
                      {cert.issuer_name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    cert.status === 'ACTIVE'
                      ? isDark
                        ? 'bg-[#2D6A4F]/20 text-[#2D6A4F]'
                        : 'bg-green-100 text-green-800'
                      : isDark
                      ? 'bg-[#415A77] text-[#C5C6C0]'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cert.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Certificate #:</span>
                    <span className={`font-mono text-xs ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {cert.certificate_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Issued:</span>
                    <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>
                      {new Date(cert.issued_date).toLocaleDateString()}
                    </span>
                  </div>
                  {cert.expiration_date && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Expires:</span>
                      <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>
                        {new Date(cert.expiration_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {cert.skkni_code && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>SKKNI:</span>
                      <span className={`font-semibold ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        {cert.skkni_code}
                      </span>
                    </div>
                  )}
                  {cert.aqrf_level && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>AQRF Level:</span>
                      <span className={`font-semibold ${
                        isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                      }`}>
                        {cert.aqrf_level}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors touch-target ${
                    isDark
                      ? 'bg-[#2D6A4F] text-white hover:bg-[#2D6A4F]/80'
                      : 'bg-[#2D6A4F] text-white hover:bg-[#2D6A4F]/80'
                  }`}>
                    View Details
                  </button>
                  <Link
                    href={`/talenta/certificates/${cert.sertifikat_id}/share`}
                    className={`flex-1 text-center px-4 py-2 rounded-lg text-sm transition-colors touch-target ${
                      isDark
                        ? 'bg-[#1B263B] border border-[#415A77] text-[#E0E1DD] hover:border-[#2D6A4F]'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Share
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {certificates.length === 0 && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className={`text-center py-12 px-8 rounded-lg max-w-md mx-auto ${
              isDark ? 'bg-[#1B263B]' : 'bg-white'
            }`}>
              <p className={`mb-4 ${
                isDark ? 'text-[#C5C6C0]' : 'text-gray-500'
              }`}>
                You don't have any certificates yet.
              </p>
              <Link
                href="/talenta/courses"
                className="inline-block px-6 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
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


