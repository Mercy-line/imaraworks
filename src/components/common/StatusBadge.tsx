import React from 'react';
import { PaymentStatus } from '../../types';
import { cn } from '../../lib/utils';
import {
  FileEdit,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  showIcon = true,
}) => {
  const getConfig = () => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Draft',
          icon: FileEdit,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          icon: Send,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'PENDING_APPROVAL':
        return {
          label: 'Pending Approval',
          icon: Clock,
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          icon: CheckCircle2,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'PROCESSING':
        return {
          label: 'Processing',
          icon: Loader2,
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          spin: true,
        };
      case 'PAID':
        return {
          label: 'Paid',
          icon: CheckCheck,
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
          dot: 'bg-emerald-600',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          icon: XCircle,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'FAILED':
        return {
          label: 'Failed',
          icon: AlertTriangle,
          bg: 'bg-red-100 text-red-900 border-red-300',
          dot: 'bg-red-600',
        };
      default:
        return {
          label: status,
          icon: Clock,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-2xs select-none transition-colors',
        sizeClasses[size],
        config.bg,
        className
      )}
    >
      {showIcon && (
        <Icon
          size={iconSizes[size]}
          className={cn('shrink-0', config.spin && 'animate-spin')}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
