import React from 'react';
import { ApprovalThreshold } from '../../types';
import { cn } from '../../lib/utils';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface ThresholdBadgeProps {
  threshold: ApprovalThreshold;
  className?: string;
  size?: 'sm' | 'md';
}

export const ThresholdBadge: React.FC<ThresholdBadgeProps> = ({
  threshold,
  className,
  size = 'md',
}) => {
  const isMultiTier = threshold === 'MANAGER_AND_FINANCE';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors',
        size === 'sm' ? 'text-2xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        isMultiTier
          ? 'bg-purple-50 text-purple-800 border-purple-200'
          : 'bg-indigo-50 text-indigo-800 border-indigo-200',
        className
      )}
      title={
        isMultiTier
          ? 'Payments above KES 50,000 require approval from a manager and Finance.'
          : 'Payments of KES 50,000 or less require approval from one manager.'
      }
    >
      {isMultiTier ? (
        <ShieldCheck size={size === 'sm' ? 12 : 13} className="text-purple-600 shrink-0" />
      ) : (
        <UserCheck size={size === 'sm' ? 12 : 13} className="text-indigo-600 shrink-0" />
      )}
      <span>{isMultiTier ? 'Manager + Finance (> KES 50k)' : 'Single Manager (≤ KES 50k)'}</span>
    </span>
  );
};
