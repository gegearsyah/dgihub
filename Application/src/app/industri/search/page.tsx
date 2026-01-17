'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';

interface Talent {
  talenta_id: string;
  full_name: string;
  email: string;
  city: string;
  province: string;
  skills: any;
  aqrf_level: number;
  certificate_count: number;
  skkni_codes: string[];
  max_aqrf_level: number;
  match_score: number;
}

export default function TalentSearchPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skills: '',
    skkniCodes: '',
    aqrfLevel: '',
    location: '',
    hasCertificates: false
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'INDUSTRI')) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'INDUSTRI') {
      searchTalents();
    }
  }, [isAuthenticated, filters]);

  const searchTalents = async () => {
    try {
      setLoading(true);
      const searchFilters: any = {};
      if (filters.skills) searchFilters.skills = filters.skills.split(',').map(s => s.trim());
      if (filters.skkniCodes) searchFilters.skkniCodes = filters.skkniCodes.split(',').map(s => s.trim());
      if (filters.aqrfLevel) searchFilters.aqrfLevel = filters.aqrfLevel;
      if (filters.location) searchFilters.location = filters.location;
      if (filters.hasCertificates) searchFilters.hasCertificates = true;

      const response = await apiClient.searchTalenta(searchFilters);
      if (response.success && response.data) {
        const data = response.data as any;
        setTalents(Array.isArray(data?.talents) ? data.talents : []);
      }
    } catch (error) {
      console.error('Failed to search talents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? 'border-[#0EB0F9]' : 'border-[#0EB0F9]'
          }`}></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-3xl font-bold mb-8 ${
          isDark ? 'text-foreground' : 'text-gray-900'
        }`}>Talent Search</h1>

        <div className={`rounded-lg shadow p-6 mb-8 border ${
          isDark ? 'bg-card border-border' : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-foreground' : 'text-gray-700'
              }`}>Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., JavaScript, Python"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-foreground' : 'text-gray-700'
              }`}>SKKNI Codes</label>
              <input
                type="text"
                value={filters.skkniCodes}
                onChange={(e) => setFilters({ ...filters, skkniCodes: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., IT-2023-001"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-foreground' : 'text-gray-700'
              }`}>AQRF Level</label>
              <select
                value={filters.aqrfLevel}
                onChange={(e) => setFilters({ ...filters, aqrfLevel: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-muted border-border text-foreground'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Any Level</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                  <option key={level} value={level}>Level {level}+</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-foreground' : 'text-gray-700'
              }`}>Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="City or Province"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={`flex items-center cursor-pointer ${
              isDark ? 'text-foreground' : 'text-gray-700'
            }`}>
              <input
                type="checkbox"
                checked={filters.hasCertificates}
                onChange={(e) => setFilters({ ...filters, hasCertificates: e.target.checked })}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm">Has Certificates Only</span>
            </label>
          </div>
          <button
            onClick={searchTalents}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((talent) => (
            <div 
              key={talent.talenta_id || `talent-${talent.full_name}`}
              className={`rounded-lg shadow-md p-6 border ${
                isDark ? 'bg-card border-border' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-foreground' : 'text-gray-900'
              }`}>{talent.full_name}</h3>
              <p className={`text-sm mb-4 ${
                isDark ? 'text-muted-foreground' : 'text-gray-600'
              }`}>{talent.city}, {talent.province}</p>
              
              <div className={`space-y-2 mb-4 text-sm ${
                isDark ? 'text-muted-foreground' : 'text-gray-600'
              }`}>
                <div className="flex justify-between">
                  <span>Certificates:</span>
                  <span className={`font-semibold ${
                    isDark ? 'text-foreground' : 'text-gray-900'
                  }`}>{talent.certificate_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>AQRF Level:</span>
                  <span className={`font-semibold ${
                    isDark ? 'text-foreground' : 'text-gray-900'
                  }`}>{talent.max_aqrf_level || 'N/A'}</span>
                </div>
                {talent.skkni_codes && talent.skkni_codes.length > 0 && (
                  <div>
                    <span>SKKNI Codes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {talent.skkni_codes.slice(0, 3).map((code: string, idx: number) => (
                        <span 
                          key={`code-${idx}-${code}`}
                          className={`px-2 py-1 text-xs rounded ${
                            isDark
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Match Score:</span>
                  <span className={`font-semibold ${
                    isDark ? 'text-foreground' : 'text-gray-900'
                  }`}>{talent.match_score || 0}/3</span>
                </div>
              </div>

              <Link
                href={`/industri/talenta/${talent.talenta_id}`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>

        {talents.length === 0 && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className={`text-center py-12 px-8 rounded-lg shadow max-w-md mx-auto border ${
              isDark ? 'bg-card border-border' : 'bg-white border-gray-200'
            }`}>
              <p className={isDark ? 'text-muted-foreground' : 'text-gray-500'}>
                No talents found. Try adjusting your search filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}




