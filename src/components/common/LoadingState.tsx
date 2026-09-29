import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'table-skeleton' | 'card-skeleton' | 'page';
  text?: string;
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  text = 'Loading data...',
  rows = 5,
  className,
}) => {
  if (type === 'page') {
    return (
      <div className={cn('min-h-[400px] flex flex-col items-center justify-center p-12', className)}>
        <Loader2 className="w-8 h-8 text-slate-800 animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>
      </div>
    );
  }

  if (type === 'table-skeleton') {
    return (
      <div className={cn('w-full space-y-3 p-4 bg-white rounded-xl border border-slate-200', className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        </div>
        {/* Row skeletons */}
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 animate-pulse"
          >
            <div className="flex items-center gap-3 w-1/3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0"></div>
              <div className="space-y-1.5 w-full">
                <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-1/6"></div>
            <div className="h-6 bg-slate-100 rounded-full w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card-skeleton') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-200 rounded w-24"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-36"></div>
            <div className="h-2.5 bg-slate-100 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center p-6 text-slate-500 gap-2', className)}>
      <Loader2 className="w-5 h-5 text-slate-700 animate-spin" />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
};
