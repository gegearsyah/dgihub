'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'settings'>('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    city: '',
    province: '',
    bio: ''
  });
  const [skills, setSkills] = useState(['JavaScript', 'React', 'Node.js']);
  const [saving, setSaving] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: '',
        city: '',
        province: '',
        bio: ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone
      });

      if (response.success) {
        alert('Profile updated successfully!');
        // Refresh user data
        window.location.reload();
      } else {
        alert(response.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'skills'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button
                          onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a skill..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setSkills([...skills, e.currentTarget.value]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive SMS updates</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-500">Make profile visible to employers</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to change your password?')) {
                        alert('Password change form would appear here');
                      }
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


