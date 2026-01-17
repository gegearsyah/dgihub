'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import AppLayout from '@/components/AppLayout';

export default function TalentPoolPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [talentPool, setTalentPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    hasCertificates: false,
    minAQRF: ''
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'INDUSTRI')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'INDUSTRI') {
      loadTalentPool();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadTalentPool = async () => {
    try {
      setLoading(true);
      // This would call a talent pool endpoint
      // For now, we'll use search with saved filter
      const response = await apiClient.searchTalenta({
        hasCertificates: filters.hasCertificates || undefined,
        aqrfLevel: filters.minAQRF || undefined
      });
      
      if (response.success && response.data) {
        // Filter saved to talent pool (would need backend flag)
        const data = response.data as any;
        setTalentPool(Array.isArray(data?.talents) ? data.talents : []);
      }
    } catch (error) {
      console.error('Failed to load talent pool:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTalentPool();
    }
  }, [filters]);

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
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-foreground' : 'text-gray-900'
          }`}>Talent Pool</h1>
          <p className={isDark ? 'text-muted-foreground' : 'text-gray-600'}>
            Manage your saved candidates and potential hires
          </p>
        </div>

        {/* Filters */}
        <div className={`rounded-lg p-6 mb-8 border ${
          isDark ? 'bg-card border-border' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-foreground' : 'text-gray-700'
              }`}>Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, skills..."
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-muted border-border text-foreground placeholder:text-muted-foreground'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-foreground' : 'text-gray-700'
              }`}>Minimum AQRF Level</label>
              <select
                value={filters.minAQRF}
                onChange={(e) => setFilters({ ...filters, minAQRF: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-muted border-border text-foreground'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Levels</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className={`flex items-center cursor-pointer ${
                isDark ? 'text-foreground' : 'text-gray-700'
              }`}>
                <input
                  type="checkbox"
                  checked={filters.hasCertificates}
                  onChange={(e) => setFilters({ ...filters, hasCertificates: e.target.checked })}
                  className="mr-2 w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Has Certificates Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Talent List */}
        <div className="space-y-4">
          {talentPool.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className={`rounded-lg p-12 text-center max-w-md mx-auto border ${
                isDark ? 'bg-card border-border' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <p className={isDark ? 'text-muted-foreground mb-4' : 'text-gray-600 mb-4'}>
                  No talent in your pool yet
                </p>
                <Link
                  href="/industri/search"
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Search for Talent
                </Link>
              </div>
            </div>
          ) : (
            talentPool.map((talent: any) => (
              <div 
                key={talent.talenta_id || `talent-${talent.full_name}`}
                className={`rounded-lg p-6 border ${
                  isDark ? 'bg-card border-border' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold mb-1 ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>{talent.full_name}</h3>
                    <p className={`text-sm mb-2 ${
                      isDark ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>{talent.email}</p>
                    <p className={`text-sm ${
                      isDark ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>
                      📍 {talent.city}, {talent.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {talent.match_score > 0 && (
                      <span className={`px-3 py-1 rounded-full text-sm border ${
                        isDark
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-blue-100 text-blue-700 border-blue-300'
                      }`}>
                        Match: {talent.match_score}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm ${
                  isDark ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  <div>
                    <span>Certificates:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>{talent.certificate_count || 0}</span>
                  </div>
                  <div>
                    <span>AQRF Level:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>{talent.aqrf_level || 'N/A'}</span>
                  </div>
                  <div>
                    <span>Max AQRF:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>{talent.max_aqrf_level || 'N/A'}</span>
                  </div>
                  <div>
                    <span>SKKNI Codes:</span>
                    <span className={`ml-2 font-medium ${
                      isDark ? 'text-foreground' : 'text-gray-900'
                    }`}>
                      {talent.skkni_codes?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/industri/talenta/${talent.talenta_id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    View Profile
                  </Link>
                  <button className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    isDark
                      ? 'border-border text-foreground hover:bg-muted'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Remove from Pool
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}


