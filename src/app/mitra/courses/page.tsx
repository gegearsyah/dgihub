'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function MitraCoursesPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationHours: '',
    price: '',
    skkniCode: '',
    aqrfLevel: ''
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'MITRA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'MITRA') {
      loadCourses();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMitraCourses();
      if (response.success && response.data) {
        setCourses(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createCourse({
        title: formData.title,
        description: formData.description,
        durationHours: parseInt(formData.durationHours),
        price: parseFloat(formData.price) || 0,
        skkniCode: formData.skkniCode || undefined,
        aqrfLevel: formData.aqrfLevel ? parseInt(formData.aqrfLevel) : undefined,
      });

      if (response.success) {
        alert('Course created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          durationHours: '',
          price: '',
          skkniCode: '',
          aqrfLevel: ''
        });
        loadCourses(); // Refresh courses list
      } else {
        alert(response.message || 'Failed to create course');
      }
    } catch (error) {
      alert('Failed to create course');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Course'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours)</label>
                  <input
                    type="number"
                    required
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rp)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKKNI Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.skkniCode}
                    onChange={(e) => setFormData({ ...formData, skkniCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AQRF Level (Optional)</label>
                  <select
                    value={formData.aqrfLevel}
                    onChange={(e) => setFormData({ ...formData, aqrfLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Level</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                      <option key={level} value={level}>Level {level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Course
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No courses yet. Create your first course!
            </div>
          ) : (
            courses.map((course: any) => (
              <div key={course.kursus_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                    course.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">Rp {course.price?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enrollments:</span>
                    <span className="font-medium">{course.enrollment_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Materials:</span>
                    <span className="font-medium">{course.material_count || 0}</span>
                  </div>
                  {course.skkni_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">SKKNI:</span>
                      <span className="font-medium">{course.skkni_code}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/mitra/courses/${course.kursus_id}/participants`}
                    className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    View Participants ({course.enrollment_count || 0})
                  </Link>
                  <Link
                    href={`/mitra/certificates/issue?courseId=${course.kursus_id}`}
                    className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm"
                  >
                    Issue Cert
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}



