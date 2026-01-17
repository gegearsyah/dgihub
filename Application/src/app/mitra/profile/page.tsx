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
  Shield, Certificate, FileCheck, Building
} from 'lucide-react';

export default function MitraProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { success, error: showError, info } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'MITRA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'MITRA') {
      loadProfile();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Load profile data - you'll need to create this API endpoint
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
      const response = await apiClient.updateMitraProfile(formData);
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
          Verified LPK
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

  const getAccreditationBadge = () => {
    if (!profile) return null;
    
    if (profile.accreditation_status === 'ACCREDITED') {
      const isExpired = profile.accreditation_expires_at && 
        new Date(profile.accreditation_expires_at) < new Date();
      
      if (isExpired) {
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Accreditation Expired
          </Badge>
        );
      }
      
      return (
        <Badge className="bg-[#0EB0F9] text-white">
          <Award className="w-3 h-3 mr-1" />
          Accredited
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-gray-500 text-white">
        <Clock className="w-3 h-3 mr-1" />
        {profile.accreditation_status || 'Pending'}
      </Badge>
    );
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
                LPK Profile
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                Manage your LPK (Lembaga Pelatihan Kerja) profile and credentials
              </p>
            </div>
            <div className="flex gap-2">
              {getVerificationBadge()}
              {getAccreditationBadge()}
            </div>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="lpk">LPK Credentials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Organization details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Organization Name *</Label>
                    <Input
                      value={formData.organization_name || ''}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      placeholder="Nama Lembaga Pelatihan Kerja"
                    />
                  </div>
                  <div>
                    <Label>Registration Number *</Label>
                    <Input
                      value={formData.registration_number || ''}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      placeholder="Nomor Registrasi"
                    />
                  </div>
                  <div>
                    <Label>Tax ID (NPWP)</Label>
                    <Input
                      value={formData.tax_id || ''}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      placeholder="NPWP"
                    />
                  </div>
                  <div>
                    <Label>Legal Status</Label>
                    <Input
                      value={formData.legal_status || ''}
                      onChange={(e) => setFormData({ ...formData, legal_status: e.target.value })}
                      placeholder="Yayasan, CV, PT, etc."
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
                    placeholder="Full address"
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
                  <h3 className="text-lg font-semibold mb-4">Contact Person</h3>
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
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LPK Credentials */}
          <TabsContent value="lpk">
            <Card>
              <CardHeader>
                <CardTitle>LPK Credentials & Accreditation</CardTitle>
                <CardDescription>
                  Required information to verify your LPK legitimacy according to Indonesian government regulations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>LPK License Number *</Label>
                    <Input
                      value={formData.lpk_license_number || ''}
                      onChange={(e) => setFormData({ ...formData, lpk_license_number: e.target.value })}
                      placeholder="Nomor Izin LPK"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nomor izin operasional LPK dari Dinas Tenaga Kerja
                    </p>
                  </div>
                  <div>
                    <Label>LPK Establishment Decree (SK Penetapan)</Label>
                    <Input
                      value={formData.lpk_establishment_decree || ''}
                      onChange={(e) => setFormData({ ...formData, lpk_establishment_decree: e.target.value })}
                      placeholder="Nomor SK Penetapan LPK"
                    />
                  </div>
                  <div>
                    <Label>Operational License Number</Label>
                    <Input
                      value={formData.operational_license_number || ''}
                      onChange={(e) => setFormData({ ...formData, operational_license_number: e.target.value })}
                      placeholder="Nomor Izin Operasional"
                    />
                  </div>
                  <div>
                    <Label>Years of Operation</Label>
                    <Input
                      type="number"
                      value={formData.years_of_operation || ''}
                      onChange={(e) => setFormData({ ...formData, years_of_operation: parseInt(e.target.value) || 0 })}
                      placeholder="Years"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    BNSP Accreditation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>BNSP Accreditation Number</Label>
                      <Input
                        value={formData.bnsp_accreditation_number || ''}
                        onChange={(e) => setFormData({ ...formData, bnsp_accreditation_number: e.target.value })}
                        placeholder="Nomor Akreditasi BNSP"
                      />
                    </div>
                    <div>
                      <Label>Accreditation Date</Label>
                      <Input
                        type="date"
                        value={formData.bnsp_accreditation_date || ''}
                        onChange={(e) => setFormData({ ...formData, bnsp_accreditation_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Accreditation Expiry Date</Label>
                      <Input
                        type="date"
                        value={formData.bnsp_accreditation_expiry || ''}
                        onChange={(e) => setFormData({ ...formData, bnsp_accreditation_expiry: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Organization Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Director/Leader Name</Label>
                      <Input
                        value={formData.director_name || ''}
                        onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
                        placeholder="Nama Direktur/Pimpinan"
                      />
                    </div>
                    <div>
                      <Label>Director NIP (if applicable)</Label>
                      <Input
                        value={formData.director_nip || ''}
                        onChange={(e) => setFormData({ ...formData, director_nip: e.target.value })}
                        placeholder="NIP"
                      />
                    </div>
                    <div>
                      <Label>Number of Instructors</Label>
                      <Input
                        type="number"
                        value={formData.number_of_instructors || ''}
                        onChange={(e) => setFormData({ ...formData, number_of_instructors: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Employee Count</Label>
                      <Input
                        type="number"
                        value={formData.employee_count || ''}
                        onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Field of Expertise</h3>
                  <Textarea
                    value={formData.field_of_expertise || ''}
                    onChange={(e) => setFormData({ ...formData, field_of_expertise: e.target.value })}
                    placeholder="List your fields of expertise and specializations (e.g., IT, Automotive, Hospitality, etc.)"
                    rows={4}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Facilities</h3>
                  <Textarea
                    value={formData.facilities || ''}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                    placeholder="Describe your training facilities, equipment, and infrastructure"
                    rows={4}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Training Programs</h3>
                  <Textarea
                    value={formData.training_programs || ''}
                    onChange={(e) => setFormData({ ...formData, training_programs: e.target.value })}
                    placeholder="List your training programs and courses offered"
                    rows={4}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Bank Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        value={formData.bank_name || ''}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="Bank Name"
                      />
                    </div>
                    <div>
                      <Label>Account Name</Label>
                      <Input
                        value={formData.bank_account_name || ''}
                        onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                        placeholder="Account Name"
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        value={formData.bank_account_number || ''}
                        onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                        placeholder="Account Number"
                      />
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
                <CardTitle>Documents & Certificates</CardTitle>
                <CardDescription>
                  Upload required documents to verify your LPK legitimacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>LPK License Certificate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.lpk_license_certificate_url || ''}
                        onChange={(e) => setFormData({ ...formData, lpk_license_certificate_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.lpk_license_certificate_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.lpk_license_certificate_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Certificate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.registration_certificate_url || ''}
                        onChange={(e) => setFormData({ ...formData, registration_certificate_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.registration_certificate_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.registration_certificate_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>BNSP Accreditation Certificate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.bnsp_certificate_url || ''}
                        onChange={(e) => setFormData({ ...formData, bnsp_certificate_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.bnsp_certificate_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.bnsp_certificate_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Establishment Decree (SK Penetapan)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.establishment_decree_url || ''}
                        onChange={(e) => setFormData({ ...formData, establishment_decree_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.establishment_decree_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.establishment_decree_url} target="_blank" rel="noopener noreferrer">
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
                    <Label>Domicile Certificate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.domicile_certificate_url || ''}
                        onChange={(e) => setFormData({ ...formData, domicile_certificate_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.domicile_certificate_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.domicile_certificate_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>SIUP (Business License)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.siup_url || ''}
                        onChange={(e) => setFormData({ ...formData, siup_url: e.target.value })}
                        placeholder="Document URL"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.siup_url && (
                      <Button variant="link" size="sm" asChild>
                        <a href={formData.siup_url} target="_blank" rel="noopener noreferrer">
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

          {/* Statistics */}
          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Graduates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{profile?.total_graduates || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{profile?.number_of_instructors || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{profile?.employee_count || 0}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
