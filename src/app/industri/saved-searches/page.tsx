'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AppLayout from '@/components/AppLayout';

export default function SavedSearchesPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'INDUSTRI')) {
      router.push('/login');
    } else {
      loadSavedSearches();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadSavedSearches = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter((s: any) => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const runSearch = (search: any) => {
    const params = new URLSearchParams();
    if (search.skills) params.append('skills', search.skills);
    if (search.skkniCodes) params.append('skkniCodes', search.skkniCodes);
    if (search.aqrfLevel) params.append('aqrfLevel', search.aqrfLevel);
    if (search.location) params.append('location', search.location);
    router.push(`/industri/search?${params.toString()}`);
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
          <h1 className="text-3xl font-bold mb-2">Saved Searches</h1>
          <p className="text-gray-400">Quickly access your frequently used talent searches</p>
        </div>

        {savedSearches.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-4">No saved searches yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Save your search criteria from the talent search page to access them quickly later
            </p>
            <Link
              href="/industri/search"
              className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Start Searching
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedSearches.map((search: any) => (
              <div key={search.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{search.name || 'Untitled Search'}</h3>
                  <button
                    onClick={() => deleteSearch(search.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-2 mb-4 text-sm">
                  {search.skills && (
                    <div>
                      <span className="text-gray-400">Skills:</span>
                      <span className="ml-2 text-white">{search.skills}</span>
                    </div>
                  )}
                  {search.skkniCodes && (
                    <div>
                      <span className="text-gray-400">SKKNI Codes:</span>
                      <span className="ml-2 text-white">{search.skkniCodes}</span>
                    </div>
                  )}
                  {search.aqrfLevel && (
                    <div>
                      <span className="text-gray-400">Min AQRF Level:</span>
                      <span className="ml-2 text-white">{search.aqrfLevel}</span>
                    </div>
                  )}
                  {search.location && (
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <span className="ml-2 text-white">{search.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => runSearch(search)}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                  >
                    Run Search
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}


