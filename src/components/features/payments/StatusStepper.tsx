import React from 'react';
import { PaymentStatus } from '../../../types';
import { cn } from '../../../lib/utils';
import {
  FileEdit,
  Send,
  Clock,
  CheckCircle2,
  Loader2,
  CheckCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface StatusStepperProps {
  status: PaymentStatus;
  rejectionReason?: string;
  failureReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  className?: string;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({
  status,
  rejectionReason,
  failureReason,
  className,
}) => {
  const steps = [
    { key: 'DRAFT', label: 'Draft', icon: FileEdit },
    { key: 'SUBMITTED', label: 'Submitted', icon: Send },
    { key: 'PENDING_APPROVAL', label: 'Pending Approval', icon: Clock },
    { key: 'APPROVED', label: 'Approved', icon: CheckCircle2 },
    { key: 'PROCESSING', label: 'Processing', icon: Loader2 },
    { key: 'PAID', label: 'Paid', icon: CheckCheck },
  ];

  const getStepState = (stepIndex: number) => {
    if (status === 'REJECTED') {
      if (stepIndex < 2) return 'completed';
      if (stepIndex === 2) return 'rejected';
      return 'upcoming';
    }

    if (status === 'FAILED') {
      if (stepIndex < 4) return 'completed';
      if (stepIndex === 4) return 'failed';
      return 'upcoming';
    }

    const order: Record<PaymentStatus, number> = {
      DRAFT: 0,
      SUBMITTED: 1,
      PENDING_APPROVAL: 2,
      APPROVED: 3,
      PROCESSING: 4,
      PAID: 5,
      REJECTED: 2,
      FAILED: 4,
    };

    const currentIndex = order[status] ?? 0;

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className={cn('w-full bg-white rounded-xl border border-slate-200 p-5 shadow-subtle', className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Payment Lifecycle Progress
        </h4>
        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          Current State: {status.replace('_', ' ')}
        </span>
      </div>

      {/* Stepper Flow */}
      <div className="relative flex items-center justify-between w-full">
        {/* Connecting Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const Icon =
            state === 'rejected'
              ? XCircle
              : state === 'failed'
              ? AlertTriangle
              : step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 group">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all border-2',
                  state === 'completed' &&
                    'bg-emerald-600 border-emerald-600 text-white shadow-xs',
                  state === 'current' &&
                    'bg-slate-900 border-slate-900 text-white ring-4 ring-slate-200',
                  state === 'rejected' &&
                    'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100',
                  state === 'failed' &&
                    'bg-amber-600 border-amber-600 text-white ring-4 ring-amber-100',
                  state === 'upcoming' &&
                    'bg-white border-slate-300 text-slate-400'
                )}
              >
                <Icon
                  size={15}
                  className={cn(
                    state === 'current' && step.key === 'PROCESSING' && 'animate-spin'
                  )}
                />
              </div>

              <span
                className={cn(
                  'mt-2 text-2xs font-semibold text-center whitespace-nowrap',
                  state === 'completed' && 'text-emerald-800',
                  state === 'current' && 'text-slate-900 font-bold',
                  state === 'rejected' && 'text-rose-700 font-bold',
                  state === 'failed' && 'text-amber-800 font-bold',
                  state === 'upcoming' && 'text-slate-400 font-normal'
                )}
              >
                {state === 'rejected'
                  ? 'Rejected'
                  : state === 'failed'
                  ? 'Failed'
                  : step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Exception Warning Banners if Rejected or Failed */}
      {status === 'REJECTED' && rejectionReason && (
        <div className="mt-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Payment Request Rejected: </span>
            <span className="leading-snug">"{rejectionReason}"</span>
          </div>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="mt-5 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Payment Disbursement Alert: </span>
            <span className="leading-snug">
              {failureReason ||
                'Provider transaction timed out or was rejected. Use the Reconciliation desk to verify bank debit before re-attempting.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
