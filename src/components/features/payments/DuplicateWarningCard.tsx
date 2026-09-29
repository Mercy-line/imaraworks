import React from 'react';
import { PaymentRequest } from '../../../types';
import { useNavigation } from '../../../contexts/NavigationContext';
import { AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';
import { formatKES } from '../../../lib/formatters';

interface DuplicateWarningCardProps {
  existingRequest: PaymentRequest;
  onViewExisting?: () => void;
}

export const DuplicateWarningCard: React.FC<DuplicateWarningCardProps> = ({
  existingRequest,
  onViewExisting,
}) => {
  const { navigateTo } = useNavigation();

  const handleInspect = () => {
    if (onViewExisting) {
      onViewExisting();
    } else {
      navigateTo('payment-detail', existingRequest.id);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs shadow-xs animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg shrink-0 text-amber-800">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wide">
            Possible Duplicate Invoice Warning
          </h5>
          <p className="text-amber-800 mt-1 leading-relaxed">
            An active payment request for <strong className="text-amber-950">{existingRequest.vendor_name}</strong> with invoice number <strong className="font-mono text-amber-950">{existingRequest.invoice_number}</strong> already exists ({existingRequest.id} — {formatKES(existingRequest.amount)}).
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleInspect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900 text-white font-semibold text-2xs hover:bg-amber-800 transition-colors shadow-2xs"
            >
              <span>View Existing Request {existingRequest.id}</span>
              <ArrowRight size={12} />
            </button>
            <span className="text-2xs text-amber-700">
              Current Status: {existingRequest.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
