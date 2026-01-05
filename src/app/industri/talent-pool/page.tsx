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
          <h1 className="text-3xl font-bold mb-2">Talent Pool</h1>
          <p className="text-gray-400">Manage your saved candidates and potential hires</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, skills..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Minimum AQRF Level</label>
              <select
                value={filters.minAQRF}
                onChange={(e) => setFilters({ ...filters, minAQRF: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Levels</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasCertificates}
                  onChange={(e) => setFilters({ ...filters, hasCertificates: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm text-gray-300">Has Certificates Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Talent List */}
        <div className="space-y-4">
          {talentPool.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">No talent in your pool yet</p>
              <Link
                href="/industri/search"
                className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Search for Talent
              </Link>
            </div>
          ) : (
            talentPool.map((talent: any) => (
              <div key={talent.talenta_id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{talent.full_name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{talent.email}</p>
                    <p className="text-sm text-gray-400">
                      📍 {talent.city}, {talent.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {talent.match_score > 0 && (
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm border border-indigo-500/30">
                        Match: {talent.match_score}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Certificates:</span>
                    <span className="ml-2 text-white font-medium">{talent.certificate_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">AQRF Level:</span>
                    <span className="ml-2 text-white font-medium">{talent.aqrf_level || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max AQRF:</span>
                    <span className="ml-2 text-white font-medium">{talent.max_aqrf_level || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">SKKNI Codes:</span>
                    <span className="ml-2 text-white font-medium">
                      {talent.skkni_codes?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/industri/talenta/${talent.talenta_id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                  >
                    View Profile
                  </Link>
                  <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg text-sm">
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


