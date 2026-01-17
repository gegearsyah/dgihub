'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, FileText, Award, Users, MapPin, Phone, Mail, Globe, 
  Banknote, User, CheckCircle2, XCircle, Clock, Upload, Download,
  Shield, Certificate, Briefcase, Factory
} from 'lucide-react';

export default function IndustriProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'INDUSTRI')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'INDUSTRI') {
      loadProfile();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData(response.data);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.updateIndustriProfile(formData);
      if (response.success) {
        success('Profile updated successfully!');
        loadProfile();
      } else {
        showError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getVerificationBadge = () => {
    if (!profile) return null;
    
    if (profile.verification_status === 'VERIFIED') {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified Company
        </Badge>
      );
    } else if (profile.verification_status === 'REJECTED') {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-500 text-white">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? 'border-primary' : 'border-primary'
          }`}></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                Company Profile
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                Manage your company profile and information
              </p>
            </div>
            {getVerificationBadge()}
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Company Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic company details and business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <Label>Company Tax ID (NPWP) *</Label>
                    <Input
                      value={formData.company_tax_id || ''}
                      onChange={(e) => setFormData({ ...formData, company_tax_id: e.target.value })}
                      placeholder="NPWP"
                    />
                  </div>
                  <div>
                    <Label>Company Type</Label>
                    <Input
                      value={formData.company_type || ''}
                      onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                      placeholder="PT, CV, PT Tbk, etc."
                    />
                  </div>
                  <div>
                    <Label>Industry Sector</Label>
                    <Input
                      value={formData.industry_sector || ''}
                      onChange={(e) => setFormData({ ...formData, industry_sector: e.target.value })}
                      placeholder="e.g., Technology, Manufacturing, Services"
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+62..."
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full company address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Input
                      value={formData.province || ''}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="Province"
                    />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={formData.postal_code || ''}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Business Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Tax Incentive Eligible</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={formData.tax_incentive_eligible || false}
                          onChange={(e) => setFormData({ ...formData, tax_incentive_eligible: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-muted-foreground">
                          Eligible for tax incentives
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Company Documents</CardTitle>
                <CardDescription>
                  Upload required documents to verify your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Registration Certificate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.company_registration_url || ''}
                        onChange={(e) => setFormData({ ...formData, company_registration_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.company_registration_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.company_registration_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tax Certificate (NPWP)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.tax_certificate_url || ''}
                        onChange={(e) => setFormData({ ...formData, tax_certificate_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.tax_certificate_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.tax_certificate_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Business License (SIUP)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.business_license_url || ''}
                        onChange={(e) => setFormData({ ...formData, business_license_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.business_license_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.business_license_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Details */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Person</CardTitle>
                <CardDescription>
                  Primary contact person for company communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Contact Person Name</Label>
                    <Input
                      value={formData.contact_person_name || ''}
                      onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      value={formData.contact_person_position || ''}
                      onChange={(e) => setFormData({ ...formData, contact_person_position: e.target.value })}
                      placeholder="Position"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.contact_person_email || ''}
                      onChange={(e) => setFormData({ ...formData, contact_person_email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.contact_person_phone || ''}
                      onChange={(e) => setFormData({ ...formData, contact_person_phone: e.target.value })}
                      placeholder="+62..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
