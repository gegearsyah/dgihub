'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Share2, CheckCircle2, Calendar, Award, 
  Building2, FileText, QrCode, Copy, ExternalLink, Shield, Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function CertificateDetailPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const certificateId = params?.id as string;
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && certificateId) {
      loadCertificate();
    }
  }, [isAuthenticated, authLoading, certificateId, router]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCertificates();
      if (response.success && response.data) {
        const certificates = Array.isArray(response.data) ? response.data : [];
        const cert = certificates.find((c: any) => 
          c.sertifikat_id === certificateId || c.certificate_id === certificateId
        );
        if (cert) {
          setCertificate(cert);
        } else {
          showError('Certificate not found');
        }
      }
    } catch (err) {
      console.error('Failed to load certificate:', err);
      showError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificateId}`;
    navigator.clipboard.writeText(shareUrl);
    success('Certificate link copied to clipboard!');
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    success('PDF download feature coming soon!');
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const response = await apiClient.verifyCertificate(certificateId);
      if (response.success) {
        success('Certificate verified successfully!');
      } else {
        showError('Certificate verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      showError('Failed to verify certificate');
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? 'border-[#0EB0F9]' : 'border-[#0EB0F9]'
          }`}></div>
        </div>
      </AppLayout>
    );
  }

  if (!certificate) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] py-12">
              <FileText className={`w-16 h-16 mb-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
              <p className={`text-lg font-medium mb-2 ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                Certificate not found
              </p>
              <Button asChild className="mt-4">
                <Link href="/talenta/certificates">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Certificates
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/talenta/certificates">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                Certificate Details
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                View and manage your certificate
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          {/* Certificate Details */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Certificate Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{certificate.title}</CardTitle>
                      {certificate.course_title && (
                        <p className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {certificate.course_title}
                        </p>
                      )}
                    </div>
                    <Badge className={
                      certificate.status === 'ACTIVE'
                        ? 'bg-[#0EB0F9]/10 text-[#0878B3] border-[#0EB0F9]/30'
                        : certificate.status === 'EXPIRED'
                        ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30'
                        : 'bg-red-500/10 text-red-700 border-red-500/30'
                    }>
                      {certificate.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Certificate Number */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Certificate Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-lg font-semibold">{certificate.certificate_number}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(certificate.certificate_number);
                          success('Certificate number copied!');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Issued To */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Issued To</Label>
                    <p className="text-lg font-semibold mt-1">{user?.fullName || 'User'}</p>
                  </div>

                  {/* Issued By */}
                  <div>
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Issued By
                    </Label>
                    <p className="text-lg font-medium mt-1">{certificate.issuer_name}</p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Issue Date
                      </Label>
                      <p className="font-medium mt-1">{formatDate(certificate.issued_date)}</p>
                    </div>
                    {certificate.expiration_date && (
                      <div>
                        <Label className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Expiration Date
                        </Label>
                        <p className="font-medium mt-1">{formatDate(certificate.expiration_date)}</p>
                      </div>
                    )}
                  </div>

                  {/* SKKNI & AQRF */}
                  {(certificate.skkni_code || certificate.aqrf_level) && (
                    <div className="border-t pt-4">
                      <Label className="text-sm text-muted-foreground mb-2">Competency Standards</Label>
                      <div className="flex flex-wrap gap-2">
                        {certificate.skkni_code && (
                          <Badge variant="outline" className="bg-[#0EB0F9]/10 text-[#0878B3] border-[#0EB0F9]/30">
                            <FileText className="w-3 h-3 mr-1" />
                            SKKNI: {certificate.skkni_code}
                          </Badge>
                        )}
                        {certificate.aqrf_level && (
                          <Badge variant="outline" className="bg-[#0EB0F9]/10 text-[#0878B3] border-[#0EB0F9]/30">
                            <Award className="w-3 h-3 mr-1" />
                            AQRF Level {certificate.aqrf_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 rounded-lg bg-[#0EB0F9]/10 border border-[#0EB0F9]/30">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-[#0EB0F9]" />
                    <p className="font-semibold text-[#0878B3]">Verified</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This certificate is authentic
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleVerify}
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying...' : 'Verify Certificate'}
                  </Button>

                  <div className="pt-4 border-t">
                    <Label className="text-sm text-muted-foreground mb-2">Verification Link</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/${certificateId}`}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/${certificateId}`;
                          navigator.clipboard.writeText(url);
                          success('Verification link copied!');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* QR Code Display */}
                  <div className="pt-4 border-t">
                    <Label className="text-sm text-muted-foreground mb-2">QR Code</Label>
                    <div className="flex items-center justify-center p-4 bg-white rounded-lg border">
                      <QrCode className="w-32 h-32 text-gray-800" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Scan to verify this certificate
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/certificates/verify/${certificateId}`} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Verification Page
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-lg bg-[#0EB0F9]/5 border border-[#0EB0F9]/20">
                  <div className="flex items-center gap-4 mb-4">
                    <QrCode className="w-12 h-12 text-[#0EB0F9]" />
                    <div>
                      <h3 className="font-semibold text-lg">Blockchain Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        This certificate is anchored on blockchain for tamper-proof verification
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Blockchain Hash</Label>
                      <p className="font-mono text-xs mt-1 break-all">
                        {certificate.blockchain_hash || 'Not yet anchored'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Verification Status</Label>
                      <Badge className="mt-1 bg-[#0EB0F9]/10 text-[#0878B3]">
                        {certificate.verification_status || 'PENDING'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Share Certificate</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const url = `${window.location.origin}/certificates/verify/${certificateId}`;
                        navigator.clipboard.writeText(url);
                        success('Verification link copied!');
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Verification Link
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share on Social Media
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="metadata">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Certificate ID</Label>
                      <p className="font-mono text-sm mt-1">{certificate.sertifikat_id || certificate.certificate_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Credential ID</Label>
                      <p className="font-mono text-sm mt-1">{certificate.credential_id || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge className="mt-1">{certificate.status}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Created At</Label>
                      <p className="text-sm mt-1">{formatDate(certificate.created_at || certificate.issued_date)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
