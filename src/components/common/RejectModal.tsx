import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { XCircle, AlertCircle } from 'lucide-react';
import { PaymentRequest } from '../../types';
import { formatKES } from '../../lib/formatters';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
  request: PaymentRequest | null;
  isLoading?: boolean;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onReject,
  request,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError('');
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setError('Please provide a reason for rejecting this payment request.');
      return;
    }
    if (cleanReason.length < 5) {
      setError('Rejection reason must be at least 5 characters long.');
      return;
    }

    setError('');
    await onReject(cleanReason);
    setReason('');
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Payment Request"
      subtitle={`Action will reject ${request.id} and halt the payment workflow.`}
      maxWidth="md"
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request summary box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>Vendor:</span>
            <span className="font-medium text-slate-800">{request.vendor_name}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Amount:</span>
            <span className="font-semibold text-slate-900">{formatKES(request.amount)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Invoice:</span>
            <span className="font-mono text-slate-800">{request.invoice_number}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Requester:</span>
            <span className="text-slate-800">{request.requester_name}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Reason for rejection <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            rows={3}
            placeholder="Explain why this request cannot be approved (e.g., invoice discrepancy, missing site delivery note, unverified pricing)..."
            className={`w-full text-sm rounded-lg border p-2.5 transition-colors focus:outline-none focus:ring-2 ${
              error
                ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
            }`}
            disabled={isLoading}
            autoFocus
          />
          {error ? (
            <p className="flex items-center gap-1 text-xs text-rose-600 mt-1">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </p>
          ) : (
            <p className="text-2xs text-slate-400 mt-1">
              This explanation is mandatory and will be logged permanently in the immutable audit history.
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} size="sm">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={isLoading}
            leftIcon={<XCircle size={15} />}
            size="sm"
          >
            Reject Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
