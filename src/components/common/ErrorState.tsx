import React from 'react';
import { cn } from '../../lib/utils';
import { ShieldAlert, AlertOctagon, FileQuestion, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  status?: number;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  status = 500,
  title,
  message,
  onRetry,
  className,
}) => {
  const getDetails = () => {
    switch (status) {
      case 403:
        return {
          icon: ShieldAlert,
          title: title || 'Permission Denied',
          desc:
            message ||
            "You do not have permission to perform this action or view this resource under your current role.",
          color: 'text-amber-600 bg-amber-50 border-amber-200',
        };
      case 404:
        return {
          icon: FileQuestion,
          title: title || 'Resource Not Found',
          desc: message || 'The requested payment record, vendor, or entity could not be found.',
          color: 'text-slate-600 bg-slate-50 border-slate-200',
        };
      default:
        return {
          icon: AlertOctagon,
          title: title || 'An Unexpected Error Occurred',
          desc:
            message ||
            'Something went wrong while communicating with the system. Please try again or contact support.',
          color: 'text-rose-600 bg-rose-50 border-rose-200',
        };
    }
  };

  const details = getDetails();
  const Icon = details.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-slate-200 shadow-subtle',
        className
      )}
    >
      <div className={cn('p-3.5 rounded-2xl mb-3.5 border', details.color)}>
        <Icon size={32} />
      </div>
      <h3 className="text-base font-bold text-slate-900">{details.title}</h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-1.5 leading-relaxed">
        {details.desc}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />} variant="outline">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
