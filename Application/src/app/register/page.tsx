'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'TALENTA' as 'TALENTA' | 'MITRA' | 'INDUSTRI',
    nik: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      userType: formData.userType,
      nik: formData.nik || undefined,
      phone: formData.phone || undefined,
    });
    
    if (result.success) {
      router.push('/login?registered=true');
    } else {
      setError(result.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4 py-12">
      {/* Language and Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">D</span>
            </div>
          </div>
          <CardTitle className="text-3xl">DGIHub Platform</CardTitle>
          <CardDescription className="text-base mt-2">
            Buat akun baru Anda
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">Minimum 8 karakter</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">Tipe Akun</Label>
              <Select
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value as 'TALENTA' | 'MITRA' | 'INDUSTRI' })}
              >
                <SelectTrigger id="userType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TALENTA">Talenta (Pembelajar)</SelectItem>
                  <SelectItem value="MITRA">Mitra (Penyedia Pelatihan)</SelectItem>
                  <SelectItem value="INDUSTRI">Industri (Pemberi Kerja)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik">NIK (Opsional)</Label>
              <Input
                id="nik"
                name="nik"
                type="text"
                value={formData.nik}
                onChange={handleChange}
                placeholder="16-digit NIK"
                maxLength={16}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+62..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Membuat akun...' : 'Buat Akun'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}





