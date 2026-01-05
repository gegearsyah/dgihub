'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function WorkshopsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    locationName: '',
    city: '',
    capacity: '',
    price: ''
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'MITRA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'MITRA') {
      loadWorkshops();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadWorkshops = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMitraWorkshops();
      if (response.success && response.data) {
        setWorkshops(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createWorkshop({
        title: formData.title,
        description: formData.description,
        startDate: `${formData.startDate} ${formData.startTime}`,
        endDate: `${formData.startDate} ${formData.endTime}`,
        startTime: formData.startTime,
        endTime: formData.endTime,
        locationName: formData.locationName,
        city: formData.city,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price) || 0,
      });

      if (response.success) {
        alert('Workshop created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          locationName: '',
          city: '',
          capacity: '',
          price: ''
        });
        loadWorkshops();
      } else {
        alert(response.message || 'Failed to create workshop');
      }
    } catch (error) {
      alert('Failed to create workshop');
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
          <h1 className="text-3xl font-bold text-gray-900">Workshops</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Workshop'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Workshop</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                  <input
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Workshop
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No workshops yet. Create your first workshop!
              </div>
            ) : (
              workshops.map((workshop) => (
            <div key={workshop.workshop_id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{workshop.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-900">
                    {new Date(workshop.start_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="text-gray-900">{workshop.start_time || '09:00'} - {workshop.end_time || '17:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">{workshop.city || workshop.location_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registered:</span>
                  <span className="text-gray-900">
                    {workshop.registered_count || 0}/{workshop.capacity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    workshop.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                    workshop.status === 'FULL' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workshop.status}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/mitra/workshops/${workshop.workshop_id}/attendance`}
                  className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  View Attendance
                </Link>
              </div>
            </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}


