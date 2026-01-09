'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import ProfessionalCertificateCard from '@/components/certificates/ProfessionalCertificateCard';

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
  const { isAuthenticated, loading: authLoading, user } = useAuth();
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {certificates.map((cert) => {
            // Extract initials from user name
            const getInitials = (name: string) => {
              const parts = name.split(' ');
              if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
              }
              return name.substring(0, 2).toUpperCase();
            };

            // Get holder name from user context
            const holderName = user?.fullName || 'User';
            const holderInitials = getInitials(holderName);

            return (
              <ProfessionalCertificateCard
                key={cert.sertifikat_id}
                certificateId={cert.sertifikat_id}
                title={cert.title}
                specialization={cert.course_title || undefined}
                certificateNumber={cert.certificate_number}
                holderName={holderName}
                holderInitials={holderInitials}
                nik={undefined} // Should come from user profile
                issuerName={cert.issuer_name}
                issuedDate={cert.issued_date}
                kkniLevel={undefined} // Should be extracted from cert data
                aqrfLevel={cert.aqrf_level || undefined}
                skkniCode={cert.skkni_code || undefined}
                status={cert.status as 'ACTIVE' | 'EXPIRED' | 'REVOKED'}
              />
            );
          })}
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


