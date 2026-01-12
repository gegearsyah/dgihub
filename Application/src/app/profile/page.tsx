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

  // Get role-based colors
  const getRoleColors = () => {
    if (user?.userType === 'MITRA') {
      return {
        active: isDark ? 'border-indigo-400 text-indigo-300' : 'border-indigo-500 text-indigo-600',
        inactive: isDark ? 'border-transparent text-muted-foreground hover:text-foreground' : 'border-transparent text-gray-500 hover:text-gray-700',
        button: isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700',
        badge: isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-800',
      };
    } else if (user?.userType === 'INDUSTRI') {
      return {
        active: isDark ? 'border-blue-400 text-blue-300' : 'border-blue-500 text-blue-600',
        inactive: isDark ? 'border-transparent text-muted-foreground hover:text-foreground' : 'border-transparent text-gray-500 hover:text-gray-700',
        button: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
        badge: isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800',
      };
    } else {
      // TALENTA
      return {
        active: isDark ? 'border-amber-400 text-amber-300' : 'border-amber-500 text-amber-600',
        inactive: isDark ? 'border-transparent text-muted-foreground hover:text-foreground' : 'border-transparent text-gray-500 hover:text-gray-700',
        button: isDark ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-600 hover:bg-amber-700',
        badge: isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800',
      };
    }
  };

  const roleColors = getRoleColors();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-lg shadow-md border ${
          isDark ? 'bg-card border-border' : 'bg-white border-gray-200'
        }`}>
          <div className={`border-b ${
            isDark ? 'border-border' : 'border-gray-200'
          }`}>
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? roleColors.active
                    : roleColors.inactive
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'skills'
                    ? roleColors.active
                    : roleColors.inactive
                }`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? roleColors.active
                    : roleColors.inactive
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
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-foreground' : 'text-gray-900'
                  }`}>Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-foreground' : 'text-gray-700'
                      }`}>Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-foreground' : 'text-gray-700'
                      }`}>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-muted/50 border-border text-muted-foreground' 
                            : 'bg-gray-50 border-gray-300 text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-foreground' : 'text-gray-700'
                      }`}>Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-foreground' : 'text-gray-700'
                      }`}>City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-foreground' : 'text-gray-700'
                    }`}>Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${roleColors.button}`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-foreground' : 'text-gray-900'
                  }`}>Your Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, index) => (
                      <span
                        key={`skill-${index}-${skill}`}
                        className={`px-3 py-1 rounded-full text-sm flex items-center border ${
                          isDark 
                            ? roleColors.badge + ' border-current/30'
                            : roleColors.badge + ' border-transparent'
                        }`}
                      >
                        {skill}
                        <button
                          onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                          className={`ml-2 hover:opacity-70 transition-opacity ${
                            isDark ? 'text-current' : 'text-current'
                          }`}
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
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setSkills([...skills, e.currentTarget.value]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button className={`px-4 py-2 text-white rounded-lg transition-colors ${roleColors.button}`}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-foreground' : 'text-gray-900'
                  }`}>Account Settings</h3>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${
                      isDark ? 'border-border bg-muted/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-foreground' : 'text-gray-900'
                        }`}>Email Notifications</p>
                        <p className={`text-sm ${
                          isDark ? 'text-muted-foreground' : 'text-gray-500'
                        }`}>Receive email updates</p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="w-5 h-5 accent-primary" 
                      />
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${
                      isDark ? 'border-border bg-muted/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-foreground' : 'text-gray-900'
                        }`}>SMS Notifications</p>
                        <p className={`text-sm ${
                          isDark ? 'text-muted-foreground' : 'text-gray-500'
                        }`}>Receive SMS updates</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-primary" 
                      />
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${
                      isDark ? 'border-border bg-muted/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-foreground' : 'text-gray-900'
                        }`}>Profile Visibility</p>
                        <p className={`text-sm ${
                          isDark ? 'text-muted-foreground' : 'text-gray-500'
                        }`}>Make profile visible to employers</p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="w-5 h-5 accent-primary" 
                      />
                    </div>
                  </div>
                </div>
                <div className={`border-t pt-6 ${
                  isDark ? 'border-border' : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to change your password?')) {
                        alert('Password change form would appear here');
                      }
                    }}
                    className={`px-6 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'border-border text-foreground hover:bg-muted' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
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


