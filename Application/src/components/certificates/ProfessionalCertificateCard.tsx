'use client';

import { Shield, Award, Clock, Building2, QrCode, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface ProfessionalCertificateCardProps {
  certificateId: string;
  title: string;
  specialization?: string;
  certificateNumber: string;
  holderName: string;
  holderInitials: string;
  nik?: string;
  issuerName: string;
  issuedDate: string;
  kkniLevel?: number;
  aqrfLevel?: number;
  skkniCode?: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  onViewDetails?: () => void;
  onShare?: () => void;
}

export default function ProfessionalCertificateCard({
  certificateId,
  title,
  specialization,
  certificateNumber,
  holderName,
  holderInitials,
  nik,
  issuerName,
  issuedDate,
  kkniLevel,
  aqrfLevel,
  skkniCode,
  status = 'ACTIVE',
  onViewDetails,
  onShare,
}: ProfessionalCertificateCardProps) {
  const formatNIK = (nik?: string) => {
    if (!nik) return '****-****-****-****';
    if (nik.length <= 4) return `****-****-****-${nik}`;
    const last4 = nik.slice(-4);
    return `****-****-****-${last4}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative group">
      {/* Main Certificate Card */}
      <Card className="relative bg-card rounded-3xl shadow-card-hover p-8 border border-border hover:shadow-xl transition-all duration-300">
        {/* Decorative background elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl opacity-50" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-50" />

        {/* Header with badges */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-lg">{title}</h4>
              {specialization && (
                <p className="text-sm text-muted-foreground">{specialization}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Open Badge Badge */}
            <div className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-xs font-bold text-blue-600">OB</span>
            </div>
            {/* Verified Badge */}
            {status === 'ACTIVE' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 border border-success/20">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium text-success">Terverifikasi</span>
              </div>
            )}
          </div>
        </div>

        {/* Holder Info */}
        <div className="p-4 rounded-xl bg-muted/50 mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-gold flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-secondary-foreground">{holderInitials}</span>
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-foreground text-base">{holderName}</h5>
              <p className="text-sm text-muted-foreground">NIK: {formatNIK(nik)}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Penerbit</div>
              <div className="text-sm font-medium text-foreground">{issuerName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Diterbitkan</div>
              <div className="text-sm font-medium text-foreground">{formatDate(issuedDate)}</div>
            </div>
          </div>
        </div>

        {/* KKNI Level Section */}
        {(kkniLevel || aqrfLevel) && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent border border-accent-foreground/10 mb-6 relative z-10">
            <div>
              <div className="text-xs text-muted-foreground">KKNI Level</div>
              <div className="text-lg font-bold text-accent-foreground">
                {kkniLevel ? `Level ${kkniLevel}` : ''}
                {kkniLevel && aqrfLevel && ' • '}
                {aqrfLevel && `AQRF ${aqrfLevel}`}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
              <QrCode className="w-6 h-6 text-foreground" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 relative z-10">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onViewDetails}
            asChild
          >
            <Link href={`/talenta/certificates/${certificateId}`}>
              Lihat Detail
            </Link>
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={onShare}
            asChild
          >
            <Link href={`/talenta/certificates/${certificateId}/share`}>
              Bagikan
            </Link>
          </Button>
        </div>

        {/* W3C Verifiable Badge (below card) */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-card shadow-card border border-border animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-600">W3C</span>
            </div>
            <span className="text-xs font-medium text-foreground">Verifiable</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
