'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AccountInfoCardProps {
  user: {
    fullName: string;
    email: string;
    userType: string;
  };
}

export default function AccountInfoCard({ user }: AccountInfoCardProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TALENTA: 'Pembelajar',
      MITRA: 'Penyedia Pelatihan',
      INDUSTRI: 'Pemberi Kerja'
    };
    return labels[type] || type;
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Informasi Akun
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-gold text-secondary-foreground text-xl font-bold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{user.fullName}</h3>
            <p className="text-sm text-muted-foreground">{getUserTypeLabel(user.userType)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="text-sm font-medium text-foreground">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Tipe Akun</div>
              <div className="text-sm font-medium text-foreground">{getUserTypeLabel(user.userType)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
