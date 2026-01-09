'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { colors } from '@/lib/design-system';

interface FiscalData {
  totalEligibleCosts: number;
  potentialDeduction: number; // 200% of costs
  submissionDeadline: string;
  deadlineAlert?: boolean; // 72hr proximity alert
  costBreakdown: {
    premises: number;
    instructors: number;
    goodsMaterials: number;
    participantIncentives: number;
  };
  compliance: {
    cooperationAgreement: 'checked' | 'pending';
    fiscalStatement: 'checked' | 'pending';
    annualReport: 'checked' | 'pending';
  };
}

interface FiscalIncentiveDashboardProps {
  data: FiscalData;
  onVerifyDocument?: (type: string) => void;
}

/**
 * Fiscal Incentive Dashboard
 * 200% Super Tax Deduction Tracker for Employers
 */
export default function FiscalIncentiveDashboard({
  data,
  onVerifyDocument
}: FiscalIncentiveDashboardProps) {
  const [timeUntilDeadline, setTimeUntilDeadline] = useState<string>('');

  useEffect(() => {
    const updateDeadline = () => {
      const deadline = new Date(data.submissionDeadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilDeadline('Overdue');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (hours < 72) {
        setTimeUntilDeadline(`${hours} hours remaining`);
      } else {
        setTimeUntilDeadline(`${days} days remaining`);
      }
    };

    updateDeadline();
    const interval = setInterval(updateDeadline, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [data.submissionDeadline]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-semibold text-[#E0E1DD] mb-6">
        200% Super Tax Deduction Tracker
      </h2>

      {/* Eligibility Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
          <div className="text-sm text-[#C5C6C0] mb-2">Total Eligible Costs</div>
          <div className="text-2xl font-bold text-[#E0E1DD]">
            {formatCurrency(data.totalEligibleCosts)}
          </div>
        </div>

        <div className="bg-[#1B263B] border border-[#2D6A4F] rounded-lg p-6 border-2">
          <div className="text-sm text-[#C5C6C0] mb-2">Potential Deduction (200%)</div>
          <div className="text-2xl font-bold text-[#2D6A4F]">
            {formatCurrency(data.potentialDeduction)}
          </div>
        </div>

        <div className={`bg-[#1B263B] border rounded-lg p-6 ${
          data.deadlineAlert
            ? 'border-[#BA1A1A] border-2'
            : 'border-[#415A77]'
        }`}>
          <div className="text-sm text-[#C5C6C0] mb-2">Submission Deadline</div>
          <div className="text-lg font-semibold text-[#E0E1DD] mb-1">
            {new Date(data.submissionDeadline).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <div className={`text-sm font-medium ${
            data.deadlineAlert ? 'text-[#BA1A1A]' : 'text-[#C5C6C0]'
          }`}>
            {timeUntilDeadline}
          </div>
          {data.deadlineAlert && (
            <div className="mt-2 flex items-center gap-1 text-[#BA1A1A] text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>72hr deadline alert</span>
            </div>
          )}
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="bg-[#1B263B] border border-[#415A77] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#415A77]">
          <h3 className="text-lg font-semibold text-[#E0E1DD]">Cost Breakdown</h3>
        </div>
        <div className="divide-y divide-[#415A77]">
          {Object.entries(data.costBreakdown).map(([key, value]) => (
            <div key={key} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[#E0E1DD] font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-[#C5C6C0] mt-1">
                  {formatCurrency(value)}
                </div>
              </div>
              <button
                onClick={() => onVerifyDocument?.(key)}
                className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#2D6A4F]/80 text-white rounded-lg text-sm font-medium transition-colors touch-target"
              >
                Verify Document
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-[#1B263B] border border-[#415A77] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#E0E1DD] mb-4">Compliance Checklist</h3>
        <div className="space-y-3">
          {Object.entries(data.compliance).map(([key, status]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg"
            >
              <div className="flex items-center gap-3">
                {status === 'checked' ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                )}
                <span className="text-[#E0E1DD] capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                  {key === 'cooperationAgreement' && ' (MoU) with SMK/LPK'}
                  {key === 'fiscalStatement' && ' of Tax Compliance'}
                  {key === 'annualReport' && ' (SPT 1721)'}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status === 'checked'
                    ? 'bg-[#2D6A4F]/20 text-[#2D6A4F]'
                    : 'bg-[#fbbf24]/20 text-[#fbbf24]'
                }`}
              >
                {status === 'checked' ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

