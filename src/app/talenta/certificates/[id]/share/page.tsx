'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockCertificates } from '@/lib/mockData';

export default function ShareCertificatePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const certId = params?.id as string;
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    const foundCert = mockCertificates.find(c => c.sertifikat_id === certId);
    if (foundCert) {
      setCertificate(foundCert);
    }
  }, [certId]);

  const handleShare = (platform: string) => {
    alert(`Sharing to ${platform}... (Integration would happen here)`);
  };

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/talenta/certificates" className="text-xl font-bold text-gray-900">
                ← Back to Certificates
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Share Certificate</h1>
          
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{certificate.title}</h2>
            <p className="text-gray-600 mb-4">{certificate.issuer_name}</p>
            <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-sm text-gray-500">Certificate Preview</p>
              <p className="text-xs text-gray-400 mt-2">Certificate #{certificate.certificate_number}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Share to Platform</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleShare('LinkedIn')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-4xl mb-2">💼</div>
                <div className="font-medium">LinkedIn</div>
                <div className="text-sm text-gray-500 mt-1">Share to profile</div>
              </button>
              <button
                onClick={() => handleShare('Europass')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-4xl mb-2">🌍</div>
                <div className="font-medium">Europass</div>
                <div className="text-sm text-gray-500 mt-1">Add to wallet</div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Download Options</h3>
            <div className="space-y-2">
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">PDF Certificate</div>
                    <div className="text-sm text-gray-500">Download as PDF</div>
                  </div>
                  <span className="text-2xl">📄</span>
                </div>
              </button>
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">QR Code</div>
                    <div className="text-sm text-gray-500">Verification QR code</div>
                  </div>
                  <span className="text-2xl">📱</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Verification Link</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={`https://dgihub.go.id/verify/${certificate.credential_id}`}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://dgihub.go.id/verify/${certificate.credential_id}`);
                  alert('Link copied!');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



