'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import ProfessionalCertificateCard from '@/components/certificates/ProfessionalCertificateCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Award, ArrowRight } from 'lucide-react';

interface Certificate {
  sertifikat_id: string;
  certificate_number: string;
  title: string;
  issued_date: string;
  expiration_date: string | null;
  skkni_code: string | null;
  aqrf_level: number | null;
  status: string;
  course_title: string | null;
  issuer_name: string;
}

export default function CertificateShowcase() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userType === 'TALENTA') {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCertificates();
      if (response.success && response.data) {
        const certs = Array.isArray(response.data) ? response.data : [];
        // Show only the 3 most recent certificates
        setCertificates(certs.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (user?.userType !== 'TALENTA') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Kredensial Saya
          </CardTitle>
          <CardDescription>Memuat sertifikat Anda...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (certificates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Kredensial Saya
          </CardTitle>
          <CardDescription>Belum ada sertifikat</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Mulai perjalanan pembelajaran Anda untuk mendapatkan kredensial terverifikasi.
          </p>
          <Button asChild variant="outline">
            <Link href="/talenta/courses">
              Jelajahi Kursus
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6" />
            Kredensial Saya
          </h2>
          <p className="text-muted-foreground mt-1">
            Sertifikat terverifikasi dengan standar internasional
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/talenta/certificates">
            Lihat Semua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certificates.map((cert) => {
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
              nik={undefined}
              issuerName={cert.issuer_name}
              issuedDate={cert.issued_date}
              kkniLevel={undefined}
              aqrfLevel={cert.aqrf_level || undefined}
              skkniCode={cert.skkni_code || undefined}
              status={cert.status as 'ACTIVE' | 'EXPIRED' | 'REVOKED'}
            />
          );
        })}
      </div>
    </div>
  );
}
