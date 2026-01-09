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
    <div className="space-y-6">
      {/* Profile Strength Bar */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium text-foreground">Profile Strength:</span>
        <div className="flex-1 bg-muted rounded-lg overflow-hidden h-3">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${profileStrength}%` }}
          ></div>
        </div>
        <span className="text-sm text-muted-foreground">{profileStrength}%</span>
      </div>

      <h2 className="text-2xl font-bold text-center text-foreground mb-4">
        Learning Passport
      </h2>

      {/* Portfolio Section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Artifact Vault</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPortfolioArtifacts.map((artifact: any) => (
            <Card key={artifact.id} className="relative min-h-[150px] text-center">
              <CardContent className="pt-6">
                <p className="text-foreground mb-2">{artifact.name}</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </CardContent>
              {artifact.verified && (
                <Badge className="absolute top-2 right-2" variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Incentive Wallet Section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Incentive Wallet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="text-center p-4">
            <p className="font-semibold text-foreground">Training Vouchers</p>
            <p className="text-sm text-muted-foreground mt-2">2 Active Vouchers</p>
          </Card>
          <Card className="text-center p-4">
            <p className="font-semibold text-foreground">Cash Disbursements</p>
            <p className="text-sm text-muted-foreground mt-2">Rp 700,000 Pending</p>
          </Card>
        </div>
      </div>

      {/* Credential Section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Credentials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCertificates.map((certificate) => (
            <Card key={certificate.sertifikat_id} className="relative min-h-[150px] text-center">
              <CardContent className="pt-6">
                <p className="font-bold text-foreground">{certificate.title}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(certificate.issued_date).toLocaleDateString()}
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verified
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}