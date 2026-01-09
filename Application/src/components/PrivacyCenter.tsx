'use client';

import { useState, useEffect } from 'react';
import { Trash2, History, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

interface ProcessingRecord {
  id: string;
  entity: string;
  dataType: 'NIK' | 'Biometric' | 'Personal';
  purpose: string;
  timestamp: Date;
  accessType: 'read' | 'write' | 'delete';
}

interface PrivacyCenterProps {
  processingRecords?: ProcessingRecord[];
  onDeleteRequest?: () => void;
  onConsentChange?: (type: string, enabled: boolean) => void;
}

/**
 * Privacy Center Component
 * UU PDP (Personal Data Protection) Compliance Dashboard
 */
export default function PrivacyCenter({
  processingRecords = [],
  onDeleteRequest,
  onConsentChange
}: PrivacyCenterProps) {
  const [consents, setConsents] = useState({
    biometric: false,
    employmentMatching: false,
    internationalSharing: false,
  });
  const [deleteCountdown, setDeleteCountdown] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConsentToggle = (type: keyof typeof consents) => {
    const newValue = !consents[type];
    setConsents({ ...consents, [type]: newValue });
    onConsentChange?.(type, newValue);
  };

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
    // Start 72-hour countdown
    const hours = 72;
    setDeleteCountdown(hours * 60 * 60); // Convert to seconds
  };

  useEffect(() => {
    if (deleteCountdown !== null && deleteCountdown > 0) {
      const timer = setInterval(() => {
        setDeleteCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [deleteCountdown]);

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-semibold text-[#E0E1DD] mb-6">Privacy Center</h2>

      {/* Processing Record */}
      <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-[#E0E1DD]">Processing Record</h3>
        </div>
        <p className="text-sm text-[#C5C6C0] mb-4">
          View who has accessed your personal data (NIK, Biometric, etc.)
        </p>

        {processingRecords.length === 0 ? (
          <p className="text-sm text-[#C5C6C0] text-center py-4">
            No processing records found
          </p>
        ) : (
          <div className="space-y-2">
            {processingRecords.map((record) => (
              <div
                key={record.id}
                className="bg-[#0D1B2A] rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-[#E0E1DD] font-medium">{record.entity}</div>
                  <div className="text-sm text-[#C5C6C0] mt-1">
                    {record.dataType} • {record.purpose} • {record.accessType}
                  </div>
                  <div className="text-xs text-[#C5C6C0] mt-1">
                    {new Date(record.timestamp).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consent Management */}
      <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#E0E1DD] mb-4">Consent Management</h3>
        <p className="text-sm text-[#C5C6C0] mb-4">
          Control how your personal data is used
        </p>

        <div className="space-y-4">
          {Object.entries(consents).map(([key, value]) => (
            <div
              key={key}
              className="bg-[#0D1B2A] rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="text-[#E0E1DD] font-medium capitalize">
                  {key === 'biometric' && 'Biometric Use'}
                  {key === 'employmentMatching' && 'Employment Matching'}
                  {key === 'internationalSharing' && 'International Sharing'}
                </div>
                <div className="text-sm text-[#C5C6C0] mt-1">
                  {key === 'biometric' && 'Allow use of biometric data for verification'}
                  {key === 'employmentMatching' && 'Allow employers to match your profile'}
                  {key === 'internationalSharing' && 'Allow sharing with international partners'}
                </div>
              </div>
              <button
                onClick={() => handleConsentToggle(key as keyof typeof consents)}
                className="touch-target"
                aria-label={`Toggle ${key}`}
              >
                {value ? (
                  <ToggleRight className="h-6 w-6 text-primary" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right to Deletion */}
      <div className="bg-[#1B263B] border border-[#BA1A1A] rounded-lg p-6 border-2">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold text-[#E0E1DD]">Right to Deletion</h3>
        </div>
        <p className="text-sm text-[#C5C6C0] mb-4">
          Request permanent deletion of your account and all associated data. This action cannot be undone.
        </p>

        {deleteCountdown !== null && deleteCountdown > 0 && (
          <div className="mb-4 p-4 bg-[#BA1A1A]/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-[#E0E1DD] font-semibold">Deletion Request Pending</span>
            </div>
            <p className="text-sm text-[#C5C6C0]">
              Fulfillment countdown: <span className="font-semibold text-[#BA1A1A]">{formatCountdown(deleteCountdown)}</span>
            </p>
            <p className="text-xs text-[#C5C6C0] mt-2">
              Your account and data will be permanently deleted within 72 hours.
            </p>
          </div>
        )}

        {!showDeleteConfirm ? (
          <button
            onClick={handleDeleteRequest}
            className="w-full px-6 py-3 bg-[#BA1A1A] hover:bg-[#BA1A1A]/80 text-white rounded-lg font-medium transition-colors touch-target flex items-center justify-center gap-2"
          >
            <Trash2 className="h-5 w-5" />
            <span>Request Account & Data Deletion</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-[#BA1A1A]/20 border border-[#BA1A1A] rounded-lg">
              <p className="text-sm text-[#E0E1DD] mb-2">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <p className="text-xs text-[#C5C6C0]">
                All your data, certificates, and learning records will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteRequest?.();
                }}
                className="flex-1 px-6 py-3 bg-[#BA1A1A] hover:bg-[#BA1A1A]/80 text-white rounded-lg font-medium transition-colors touch-target"
              >
                Confirm Deletion
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-[#415A77] hover:bg-[#415A77]/80 text-white rounded-lg font-medium transition-colors touch-target"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

