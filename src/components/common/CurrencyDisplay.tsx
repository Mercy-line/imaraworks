import React, { useState } from 'react';
import { formatKES } from '../../lib/formatters';
import { cn } from '../../lib/utils';
import { Check, Copy } from 'lucide-react';

interface CurrencyDisplayProps {
  amount: number;
  showDecimals?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  allowCopy?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  showDecimals = false,
  size = 'md',
  className,
  allowCopy = false,
}) => {
  const [copied, setCopied] = useState(false);
  const formatted = formatKES(amount, showDecimals);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeStyles = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
    xl: 'text-xl font-bold tracking-tight',
    '2xl': 'text-2xl sm:text-3xl font-extrabold tracking-tight',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-slate-900',
        sizeStyles[size],
        className
      )}
    >
      <span>{formatted}</span>
      {allowCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors ml-0.5"
          title="Copy numeric amount"
        >
          {copied ? (
            <Check size={size === 'sm' ? 12 : 14} className="text-emerald-600" />
          ) : (
            <Copy size={size === 'sm' ? 12 : 14} />
          )}
        </button>
      )}
    </span>
  );
};
