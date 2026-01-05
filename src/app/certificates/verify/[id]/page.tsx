'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function CertificateVerifyPage() {
  const params = useParams();
  const certificateId = params?.id as string;
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.verifyCertificate(certificateId);
      
      if (response.success && response.data) {
        setCertificate(response.data);
      } else {
        setError('Certificate not found or invalid');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please check the certificate ID and try again. If you believe this is an error, contact the certificate issuer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-2">Certificate Verified</h1>
          <p className="text-gray-400">This certificate is authentic and verified</p>
        </div>

        {certificate && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
            <div className="text-center mb-8 pb-8 border-b border-gray-700">
              <h2 className="text-2xl font-bold mb-2">{certificate.title}</h2>
              <p className="text-gray-400">Certificate Number: {certificate.certificate_number}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-400 mb-1">Issued To</p>
                <p className="text-lg font-medium text-white">{certificate.recipient_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Issued By</p>
                <p className="text-lg font-medium text-white">{certificate.issuer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Issue Date</p>
                <p className="text-lg font-medium text-white">
                  {new Date(certificate.issued_date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                  {certificate.status}
                </span>
              </div>
              {certificate.skkni_code && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">SKKNI Code</p>
                  <p className="text-lg font-medium text-white font-mono">{certificate.skkni_code}</p>
                </div>
              )}
              {certificate.aqrf_level && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">AQRF Level</p>
                  <p className="text-lg font-medium text-white">Level {certificate.aqrf_level}</p>
                </div>
              )}
            </div>

            {certificate.credential_id && (
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Credential ID</p>
                <p className="text-xs font-mono text-gray-300 break-all">{certificate.credential_id}</p>
              </div>
            )}

            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-4">
                This certificate has been verified on the DGIHub platform
              </p>
              <p className="text-xs text-gray-500">
                Verification Date: {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

