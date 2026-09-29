import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
  accentColor?: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'slate';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
  accentColor = 'slate',
  onClick,
  className,
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl p-5 border transition-all duration-150 shadow-card flex flex-col justify-between relative overflow-hidden',
        highlight ? 'border-slate-800 ring-1 ring-slate-800' : 'border-slate-200/90 hover:border-slate-300',
        onClick && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={cn('p-2.5 rounded-xl border shrink-0', getAccentStyles())}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {trend.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>{trend.value}</span>
              </span>
            )}
            {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
