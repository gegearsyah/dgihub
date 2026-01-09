'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

interface Course {
  kursus_id: string;
  title: string;
  description: string;
  duration_hours: number;
  price: number;
  skkni_code: string;
  aqrf_level: number;
  provider_name: string;
  is_enrolled: boolean;
}

export default function CoursesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    skkniCode: '',
    aqrfLevel: '',
    provider: ''
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
    }
  }, [isAuthenticated, search, filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourses({
        search,
        skkniCode: filters.skkniCode || undefined,
        aqrfLevel: filters.aqrfLevel || undefined,
      });
      if (response.success && response.data) {
        const data = response.data as any;
        const coursesData = data?.courses || data;
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (kursusId: string) => {
    try {
      const response = await apiClient.enrollInCourse(kursusId);

      if (response.success) {
        alert('Successfully enrolled!');
        fetchCourses();
      } else {
        alert(response.message || 'Failed to enroll');
      }
    } catch (error) {
      alert('Failed to enroll in course');
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? 'border-[#2D6A4F]' : 'border-[#2D6A4F]'
          }`}></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
          }`}>
            Learning Hub
          </h1>
          
          <div className={`rounded-lg shadow p-4 mb-4 ${
            isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
          }`}>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#2D6A4F] ${
                isDark
                  ? 'bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD] placeholder-[#6b7280]'
                  : 'border border-gray-300'
              }`}
            />
          </div>

          <div className={`rounded-lg shadow p-4 ${
            isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-700'
                }`}>
                  SKKNI Code
                </label>
                <input
                  type="text"
                  value={filters.skkniCode}
                  onChange={(e) => setFilters({ ...filters, skkniCode: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    isDark
                      ? 'bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD]'
                      : 'border border-gray-300'
                  }`}
                  placeholder="Filter by SKKNI"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-700'
                }`}>
                  AQRF Level
                </label>
                <select
                  value={filters.aqrfLevel}
                  onChange={(e) => setFilters({ ...filters, aqrfLevel: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${
                    isDark
                      ? 'bg-[#0D1B2A] border border-[#415A77] text-[#E0E1DD]'
                      : 'border border-gray-300'
                  }`}
                >
                  <option value="">All Levels</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={() => setFilters({ skkniCode: '', aqrfLevel: '', provider: '' })}
                  className={`mt-6 px-4 py-2 rounded-lg transition-colors touch-target ${
                    isDark
                      ? 'bg-[#415A77] text-[#E0E1DD] hover:bg-[#415A77]/80'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.kursus_id} className={`rounded-lg shadow-md overflow-hidden ${
              isDark ? 'bg-[#1B263B] border border-[#415A77]' : 'bg-white'
            }`}>
              <div className="p-6">
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                }`}>
                  {course.title}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                }`}>
                  {course.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Provider:</span>
                    <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>{course.provider_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Duration:</span>
                    <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>{course.duration_hours} hours</span>
                  </div>
                  {course.skkni_code && (
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>SKKNI:</span>
                      <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>{course.skkni_code}</span>
                    </div>
                  )}
                  {course.aqrf_level && (
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>AQRF:</span>
                      <span className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}>Level {course.aqrf_level}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>Price:</span>
                    <span className={`font-semibold ${
                      isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                    }`}>
                      {course.price > 0 ? `Rp ${course.price.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                </div>

                {course.is_enrolled ? (
                  <Link
                    href={`/talenta/courses/${course.kursus_id}`}
                    className="block w-full text-center px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.kursus_id)}
                    className="w-full px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#2D6A4F]/80 transition-colors touch-target"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className={`text-center py-12 px-8 rounded-lg max-w-md mx-auto ${
              isDark ? 'bg-[#1B263B]' : 'bg-white'
            }`}>
              <p className={isDark ? 'text-[#C5C6C0]' : 'text-gray-500'}>
                No courses found. Try adjusting your filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}




