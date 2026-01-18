'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Building2, 
  PlayCircle, 
  CheckCircle2,
  FileText,
  Calendar,
  DollarSign,
  GraduationCap,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

interface Enrollment {
  enrollment_id: string;
  id?: string;
  enrolled_at: string;
  status: string;
  progress: number;
  completed_at: string | null;
  certificate_issued: boolean;
  last_accessed_at?: string;
  kursus_id: string;
  title: string;
  description: string;
  description_en?: string;
  category?: string;
  duration_hours: number;
  duration_days?: number;
  skkni_code?: string;
  skkni_name?: string;
  aqrf_level?: number;
  price: number;
  currency?: string;
  delivery_mode?: string;
  provider_name: string;
  materials_count?: number;
  published_at?: string;
  created_at?: string;
}

export default function MyCoursesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCourses();
    }
  }, [isAuthenticated]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyCourses();
      if (response.success && response.data) {
        setEnrollments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (hours: number, days?: number) => {
    if (days) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ENROLLED':
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DROPPED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getDeliveryModeIcon = (mode?: string) => {
    switch (mode) {
      case 'ONLINE':
        return '🌐';
      case 'OFFLINE':
        return '📍';
      case 'HYBRID':
        return '🔄';
      default:
        return '📚';
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = 
      enrollment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.provider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      enrollment.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (!mounted || authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            My Courses
          </h1>
          <p className="text-muted-foreground">
            Manage and continue your learning journey
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-[#1B263B] border-border text-foreground placeholder:text-muted-foreground' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'enrolled', 'completed', 'dropped'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : isDark
                    ? 'bg-[#1B263B] text-foreground border border-border hover:bg-muted'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1B263B] border-border' : 'bg-white border-gray-200'}`}>
              <div className="text-sm text-muted-foreground mb-1">Total Courses</div>
              <div className="text-2xl font-bold text-foreground">{enrollments.length}</div>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1B263B] border-border' : 'bg-white border-gray-200'}`}>
              <div className="text-sm text-muted-foreground mb-1">In Progress</div>
              <div className="text-2xl font-bold text-foreground">
                {enrollments.filter(e => e.status === 'ENROLLED' || e.status === 'ACTIVE').length}
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1B263B] border-border' : 'bg-white border-gray-200'}`}>
              <div className="text-sm text-muted-foreground mb-1">Completed</div>
              <div className="text-2xl font-bold text-foreground">
                {enrollments.filter(e => e.status === 'COMPLETED').length}
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1B263B] border-border' : 'bg-white border-gray-200'}`}>
              <div className="text-sm text-muted-foreground mb-1">Avg. Progress</div>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)}%
              </div>
            </div>
          </div>
        )}

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment, index) => (
            <div 
              key={enrollment.enrollment_id || enrollment.kursus_id || `enrollment-${index}`} 
              className={`rounded-lg shadow-lg overflow-hidden border transition-all hover:shadow-xl ${
                isDark ? 'bg-[#1B263B] border-border' : 'bg-white border-gray-200'
              }`}
            >
              {/* Course Thumbnail/Header */}
              <div className={`h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative ${
                isDark ? 'bg-primary/10' : ''
              }`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/30" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>
                    {enrollment.status}
                  </span>
                </div>
                {enrollment.delivery_mode && (
                  <div className="absolute top-3 left-3">
                    <span className="text-2xl" title={enrollment.delivery_mode}>
                      {getDeliveryModeIcon(enrollment.delivery_mode)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Course Title */}
                <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-2 min-h-[3.5rem]">
                  {enrollment.title || 'Untitled Course'}
                </h3>

                {/* Provider */}
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{enrollment.provider_name}</span>
                </div>

                {/* Description */}
                {enrollment.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {enrollment.description}
                  </p>
                )}

                {/* Course Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  {enrollment.duration_hours > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(enrollment.duration_hours, enrollment.duration_days)}</span>
                    </div>
                  )}
                  {enrollment.materials_count !== undefined && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{enrollment.materials_count} Materials</span>
                    </div>
                  )}
                  {enrollment.skkni_code && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span className="truncate">{enrollment.skkni_code}</span>
                    </div>
                  )}
                  {enrollment.aqrf_level && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>AQRF {enrollment.aqrf_level}</span>
                    </div>
                  )}
                  {enrollment.price > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(enrollment.price, enrollment.currency)}</span>
                    </div>
                  )}
                  {enrollment.category && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <span className="px-2 py-1 rounded text-xs bg-muted">
                        {enrollment.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Progress
                    </span>
                    <span className="font-semibold text-foreground">
                      {Math.round(enrollment.progress)}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-3 bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        enrollment.progress === 100
                          ? 'bg-green-500'
                          : enrollment.progress >= 50
                          ? 'bg-primary'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, enrollment.progress))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enrollment Info */}
                <div className="space-y-2 mb-4 text-xs text-muted-foreground border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Enrolled
                    </span>
                    <span className="text-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {enrollment.last_accessed_at && (
                    <div className="flex justify-between items-center">
                      <span>Last Accessed</span>
                      <span className="text-foreground">
                        {new Date(enrollment.last_accessed_at).toLocaleDateString('id-ID', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {enrollment.completed_at && (
                    <div className="flex justify-between items-center">
                      <span>Completed</span>
                      <span className="text-foreground">
                        {new Date(enrollment.completed_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {enrollment.certificate_issued && (
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Certificate Available</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={enrollment.kursus_id 
                      ? (enrollment.status === 'COMPLETED' 
                        ? `/talenta/certificates` 
                        : `/talenta/courses/${enrollment.kursus_id}/learn`)
                      : '/talenta/courses'}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    {enrollment.status === 'COMPLETED' ? (
                      <>
                        <Award className="h-4 w-4" />
                        View Certificate
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" />
                        Continue Learning
                      </>
                    )}
                  </Link>
                  <Link
                    href={`/talenta/courses/${enrollment.kursus_id}`}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    title="View Course Details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEnrollments.length === 0 && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className={`text-center py-12 px-8 rounded-lg max-w-md mx-auto border ${
              isDark ? 'bg-[#1B263B] border-border' : 'bg-white border-gray-200'
            }`}>
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No courses match your filters' 
                  : "You haven't enrolled in any courses yet"}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start your learning journey by browsing available courses'}
              </p>
              <Link
                href="/talenta/courses"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}




