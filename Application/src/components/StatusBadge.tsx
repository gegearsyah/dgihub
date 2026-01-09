'use client';

type StatusType = 'REVIEWING' | 'INTERVIEW' | 'HIRED' | 'REJECTED' | 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'INACTIVE';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const statusConfig = {
    REVIEWING: {
      label: 'Reviewing',
      colors: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      icon: '👀'
    },
    INTERVIEW: {
      label: 'Interview',
      colors: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: '💼'
    },
    HIRED: {
      label: 'Hired',
      colors: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: '✅'
    },
    REJECTED: {
      label: 'Rejected',
      colors: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: '❌'
    },
    PENDING: {
      label: 'Pending',
      colors: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      icon: '⏳'
    },
    ACCEPTED: {
      label: 'Accepted',
      colors: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: '✓'
    },
    ACTIVE: {
      label: 'Active',
      colors: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: '●'
    },
    INACTIVE: {
      label: 'Inactive',
      colors: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      icon: '○'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.colors} ${sizeClasses[size]} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}



