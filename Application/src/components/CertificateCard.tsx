'use client';

import Link from 'next/link';

interface CertificateCardProps {
  certificateId: string;
  title: string;
  certificateNumber: string;
  skkniCode?: string;
  kkniLevel?: number;
  aqrfLevel?: number;
  issuerName: string;
  issuedDate: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  courseTitle?: string;
}

export default function CertificateCard({
  certificateId,
  title,
  certificateNumber,
  skkniCode,
  kkniLevel,
  aqrfLevel,
  issuerName,
  issuedDate,
  status = 'ACTIVE',
  courseTitle
}: CertificateCardProps) {
  const statusColors = {
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    EXPIRED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    REVOKED: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          {courseTitle && (
            <p className="text-sm text-gray-400 mb-2">{courseTitle}</p>
          )}
          <p className="text-xs text-gray-500 font-mono">#{certificateNumber}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="text-gray-400 w-24">Issued by:</span>
          <span className="text-white font-medium">{issuerName}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-400 w-24">Date:</span>
          <span className="text-white">{new Date(issuedDate).toLocaleDateString('id-ID')}</span>
        </div>
        {skkniCode && (
          <div className="flex items-center text-sm">
            <span className="text-gray-400 w-24">SKKNI Code:</span>
            <span className="text-white font-mono text-xs">{skkniCode}</span>
          </div>
        )}
        {(kkniLevel || aqrfLevel) && (
          <div className="flex items-center text-sm">
            <span className="text-gray-400 w-24">Level:</span>
            <div className="flex gap-2">
              {kkniLevel && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  KKNI {kkniLevel}
                </span>
              )}
              {aqrfLevel && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  AQRF {aqrfLevel}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <Link
          href={`/talenta/certificates/${certificateId}/share`}
          className="flex-1 text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Share
        </Link>
        <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg text-sm font-medium transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}



