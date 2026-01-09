'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ImagePlus } from 'lucide-react';
import { mockCertificates, mockPortfolioArtifacts } from '@/lib/mockData';

export default function LearningPassport() {
  const profileStrength = 80; // Example strength value

  return (
    <div>
      {/* Profile Strength Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="body1" mr={2}>
          Profile Strength:
        </Typography>
        <div style={{ flex: 1, backgroundColor: '#e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${profileStrength}%`,
              backgroundColor: '#2563EB',
              height: '12px',
            }}
          ></div>
        </div>
        <Typography variant="body2" ml={2}>
          {profileStrength}%
        </Typography>
      </div>
      <Typography variant="h4" align="center" mb={2}>
        Learning Passport
      </Typography>

      {/* Portfolio Section */}
      <Typography variant="h6" mb={1} mt={2}>
        Artifact Vault
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {mockPortfolioArtifacts.map((artifact: any) => (
          <Card key={artifact.id} sx={{ minHeight: 150, textAlign: 'center', position: 'relative' }}>
            <CardContent>
              <Typography>{artifact.name}</Typography>
              <IconButton size="small" sx={{ mt: 1 }}>
                <AddPhotoIcon />
              </IconButton>
            </CardContent>
            {artifact.verified && (
              <Badge
                badgeContent={<VerifiedIcon />}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                color="primary"
              />
            )}
          </Card>
        ))}
      </div>

      {/* Incentive Wallet Section */}
      <Typography variant="h6" mt={4} mb={1}>
        Incentive Wallet
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        <Card sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body1" fontWeight="bold">Training Vouchers</Typography>
          <Typography color="text.secondary" mt={1}>2 Active Vouchers</Typography>
        </Card>
        <Card sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body1" fontWeight="bold">Cash Disbursements</Typography>
          <Typography color="text.secondary" mt={1}>Rp 700,000 Pending</Typography>
        </Card>
      </div>

      {/* Credential Section */}
      <Typography variant="h6" mt={4} mb={1}>
        Credentials
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {mockCertificates.map((certificate) => (
          <Card key={certificate.sertifikat_id} sx={{ minHeight: 150, textAlign: 'center', position: 'relative' }}>
            <CardContent>
              <Typography fontWeight="bold">{certificate.title}</Typography>
              <Typography variant="body2" mt={1}>{new Date(certificate.issued_date).toLocaleDateString()}</Typography>
              <IconButton size="small" sx={{ mt: 1 }} color="primary">
                <VerifiedIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}