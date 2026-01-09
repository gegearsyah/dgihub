'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { aqrfColors } from '@/lib/design-system';

interface Credential {
  id: string;
  badgeIcon: string; // URL or emoji
  title: string;
  issuerName: string;
  issuerLogo?: string;
  aqrfLevel: number; // 1-8
  achievementType: string; // e.g., "Micro-credential"
  creditValue?: number;
  evidenceUrl?: string; // Portfolio/GitHub link
  verified: boolean; // Cryptographic signature status
  issuedDate: string;
  skkniCode?: string;
}

interface CredentialWalletProps {
  credentials: Credential[];
}

/**
 * Credential Wallet Component
 * Open Badges 3.0 compliant verifiable credential display
 * 3-column grid layout with flip card interaction
 */
export default function CredentialWallet({ credentials }: CredentialWalletProps) {
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6 text-[#E0E1DD]">Digital Skill Passport</h2>
      
      {/* 3-Column Grid View */}
      <div className="credential-grid">
        {credentials.map((credential) => (
          <CredentialCard
            key={credential.id}
            credential={credential}
            isSelected={selectedCredential === credential.id}
            onSelect={() => setSelectedCredential(
              selectedCredential === credential.id ? null : credential.id
            )}
          />
        ))}
      </div>

      {/* AQRF Mapping Progress Bar */}
      {credentials.length > 0 && (
        <AQRFProgressBar credentials={credentials} />
      )}
    </div>
  );
}

interface CredentialCardProps {
  credential: Credential;
  isSelected: boolean;
  onSelect: () => void;
}

function CredentialCard({ credential, isSelected, onSelect }: CredentialCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative" style={{ minHeight: '200px' }}>
      <motion.div
        className="cursor-pointer"
        onClick={() => {
          onSelect();
          setIsFlipped(!isFlipped);
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front: Badge Visual */}
        <div
          className="absolute inset-0 bg-[#1B263B] border border-[#415A77] rounded-lg p-4 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-5xl mb-3">{credential.badgeIcon}</div>
          {credential.issuerLogo && (
            <img
              src={credential.issuerLogo}
              alt={credential.issuerName}
              className="h-8 mb-2"
            />
          )}
          <h3 className="text-sm font-semibold text-[#E0E1DD] mb-2">{credential.title}</h3>
          <p className="text-xs text-[#C5C6C0] mb-3">{credential.issuerName}</p>
          
          {/* Verify Status */}
          <div className="flex items-center gap-1 text-[#2D6A4F]">
            <CheckCircleIcon fontSize="small" />
            <span className="text-xs font-medium">Verified</span>
          </div>
          
          <p className="text-xs text-[#C5C6C0] mt-2">Tap to view details</p>
        </div>

        {/* Back: Detail View */}
        <div
          className="absolute inset-0 bg-[#1B263B] border border-[#415A77] rounded-lg p-4 flex flex-col"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <h3 className="text-lg font-semibold text-[#E0E1DD] mb-3">{credential.title}</h3>
          
          <div className="space-y-2 text-sm mb-4">
            <div>
              <span className="text-[#C5C6C0]">AQRF Level:</span>
              <span
                className="ml-2 font-semibold"
                style={{ color: aqrfColors[credential.aqrfLevel as keyof typeof aqrfColors] }}
              >
                Level {credential.aqrfLevel}
              </span>
            </div>
            
            <div>
              <span className="text-[#C5C6C0]">Achievement Type:</span>
              <span className="ml-2 text-[#E0E1DD]">{credential.achievementType}</span>
            </div>
            
            {credential.creditValue && (
              <div>
                <span className="text-[#C5C6C0]">Credit Value:</span>
                <span className="ml-2 text-[#E0E1DD]">{credential.creditValue}</span>
              </div>
            )}
            
            {credential.skkniCode && (
              <div>
                <span className="text-[#C5C6C0]">SKKNI Code:</span>
                <span className="ml-2 text-[#E0E1DD] font-mono text-xs">{credential.skkniCode}</span>
              </div>
            )}
            
            <div>
              <span className="text-[#C5C6C0]">Issued:</span>
              <span className="ml-2 text-[#E0E1DD]">
                {new Date(credential.issuedDate).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>

          {credential.evidenceUrl && (
            <a
              href={credential.evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2D6A4F] text-sm hover:underline mt-auto"
            >
              View Evidence →
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * AQRF Mapping Progress Bar
 * Vertical progress bar showing current skill level (1) to target (8)
 */
function AQRFProgressBar({ credentials }: { credentials: Credential[] }) {
  const maxLevel = Math.max(...credentials.map(c => c.aqrfLevel), 1);
  const levels = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="mt-8 bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#E0E1DD] mb-4">AQRF Level Mapping</h3>
      <div className="flex items-end gap-2 h-48">
        {levels.map((level) => {
          const isActive = level <= maxLevel;
          const height = (level / 8) * 100;
          
          return (
            <div key={level} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex-1 flex items-end">
                <motion.div
                  className="w-full rounded-t"
                  style={{
                    backgroundColor: aqrfColors[level as keyof typeof aqrfColors],
                    opacity: isActive ? 1 : 0.3,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: level * 0.1 }}
                />
              </div>
              <div className="mt-2 text-center">
                <div
                  className="text-xs font-semibold"
                  style={{ color: aqrfColors[level as keyof typeof aqrfColors] }}
                >
                  {level}
                </div>
                {level === 1 && <div className="text-xs text-[#C5C6C0] mt-1">Basic</div>}
                {level === 8 && <div className="text-xs text-[#C5C6C0] mt-1">Expert</div>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-[#C5C6C0] mt-4 text-center">
        Current Level: <span className="font-semibold text-[#2D6A4F]">Level {maxLevel}</span> → Target: Level 8 (Expert)
      </p>
    </div>
  );
}

