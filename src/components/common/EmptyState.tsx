import React from 'react';
import { cn } from '../../lib/utils';
import { Inbox, FileQuestion, SearchX, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'inbox' | 'search' | 'not-found' | 'completed';
  customIcon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'inbox',
  customIcon,
  actionText,
  onAction,
  className,
}) => {
  const getIcon = () => {
    if (customIcon) return customIcon;
    switch (icon) {
      case 'search':
        return <SearchX className="text-slate-400" size={36} />;
      case 'not-found':
        return <FileQuestion className="text-slate-400" size={36} />;
      case 'completed':
        return <CheckCircle className="text-emerald-500" size={36} />;
      default:
        return <Inbox className="text-slate-400" size={36} />;
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-dashed border-slate-200',
        className
      )}
    >
      <div className="p-3 bg-slate-50 rounded-2xl mb-3 border border-slate-100">{getIcon()}</div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{description}</p>
      )}
      {actionText && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction} variant="outline">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
