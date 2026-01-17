'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, CheckCircle2, XCircle, MapPin, Calendar, Download } from 'lucide-react';

export default function WorkshopAttendancePage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const workshopId = params?.id as string;
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'MITRA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'MITRA' && workshopId) {
      loadAttendance();
    }
  }, [isAuthenticated, authLoading, user, workshopId, router]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWorkshopAttendance(workshopId);
      if (response.success && response.data) {
        setAttendanceData(response.data);
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const exportToCSV = () => {
    if (!attendanceData?.attendance) return;

    const headers = ['Name', 'Email', 'Registered At', 'Status', 'Attended', 'Attendance Time'];
    const rows = attendanceData.attendance.map((item: any) => [
      item.full_name,
      item.email,
      formatDate(item.registered_at),
      item.registration_status,
      item.has_attended ? 'Yes' : 'No',
      item.attendance ? formatDate(item.attendance.attendance_timestamp) : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `workshop-attendance-${workshopId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!attendanceData) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>
                No attendance data found
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { workshop, attendance, summary } = attendanceData;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/mitra/workshops">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                Workshop Attendance
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {workshop.title}
              </p>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.total_registrations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{summary.attended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Not Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{summary.not_attended}</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance List */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance List</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <div className="text-center py-12">
                <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                <p className={isDark ? 'text-muted-foreground' : 'text-muted-foreground'}>
                  No registrations yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-border' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                        Name
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                        Email
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                        Registered
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                        Status
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                        Attendance
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((item: any) => (
                      <tr
                        key={item.registration_id}
                        className={`border-b ${isDark ? 'border-border hover:bg-card' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <td className={`py-3 px-4 ${isDark ? 'text-foreground' : 'text-foreground'}`}>
                          {item.full_name}
                        </td>
                        <td className={`py-3 px-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {item.email}
                        </td>
                        <td className={`py-3 px-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {formatDate(item.registered_at)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.registration_status === 'CONFIRMED'
                              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                              : item.registration_status === 'PENDING'
                              ? isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                              : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.registration_status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.has_attended ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Present</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="w-4 h-4" />
                              <span>Absent</span>
                            </div>
                          )}
                        </td>
                        <td className={`py-3 px-4 ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {item.attendance
                            ? formatDate(item.attendance.attendance_timestamp)
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
