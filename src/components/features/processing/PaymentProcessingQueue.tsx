import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { PaymentRequest, PaymentAttempt } from '../../../types';
import { processingApi, MockOutcomeType } from '../../../api/processingApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { StatusBadge } from '../../common/StatusBadge';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatTimeAgo, formatDateOnly, formatDateTime, formatKES } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { EmptyState } from '../../common/EmptyState';
import { LoadingState } from '../../common/LoadingState';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  ShieldCheck,
  Send,
  HelpCircle,
} from 'lucide-react';

export const PaymentProcessingQueue: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [queue, setQueue] = useState<PaymentRequest[]>([]);
  const [failedList, setFailedList] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process Modal State
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [mockOutcome, setMockOutcome] = useState<MockOutcomeType>('SUCCESS');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reconciliation Modal State
  const [reconcileRequest, setReconcileRequest] = useState<PaymentRequest | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [approved, all] = await Promise.all([
        processingApi.getProcessingQueue(),
        paymentsApi.getPaymentRequests(),
      ]);
      setQueue(approved);
      setFailedList(all.filter((r) => r.status === 'FAILED'));
    } catch (err) {
      console.error('Failed to load processing queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecutePayment = async () => {
    if (!selectedRequest || !currentUser) return;
    setIsProcessing(true);
    try {
      const res = await processingApi.processPayment(selectedRequest.id, currentUser, mockOutcome);
      if (res.attempt.status === 'SUCCESS') {
        showToast(
          'success',
          'Payment Disbursed Successfully',
          `Provider Ref: ${res.attempt.provider_reference} (KES ${selectedRequest.amount.toLocaleString()})`
        );
      } else if (res.attempt.status === 'TIMEOUT_AMBIGUOUS') {
        showToast(
          'warning',
          'Gateway Timeout Encountered',
          'Status ambiguous. Safe retry lock active; reconcile transaction before proceeding.'
        );
      } else {
        showToast('error', 'Payment Failed', res.attempt.failure_reason || 'Provider declined disbursement.');
      }
      setSelectedRequest(null);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Processing Error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteReconciliation = async (resolution: 'CONFIRM_PAID' | 'RESET_FOR_RETRY') => {
    if (!reconcileRequest || !currentUser) return;
    setIsProcessing(true);
    try {
      await processingApi.reconcilePayment(reconcileRequest.id, currentUser, resolution);
      showToast(
        'success',
        'Reconciliation Complete',
        resolution === 'CONFIRM_PAID'
          ? `${reconcileRequest.id} marked as PAID with verified bank debit.`
          : `${reconcileRequest.id} reset to APPROVED for safe retry.`
      );
      setReconcileRequest(null);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Reconciliation Error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingState type="table-skeleton" rows={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Finance Disbursement & Processing Desk
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              {queue.length} Approved Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute corporate M-Pesa B2B and bank transfer payouts with automatic idempotency protection
          </p>
        </div>
      </div>

      {/* Main Ready Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Approved Payments Queue</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-2xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Amount (KES)</th>
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Approved Date</th>
                <th className="py-3.5 px-4 text-right">Disbursement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState
                      icon="completed"
                      title="No approved requests awaiting disbursement"
                      description="All approved claims have been successfully processed. Check back after operations managers complete pending approvals."
                    />
                  </td>
                </tr>
              ) : (
                queue.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigateTo('payment-detail', req.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{req.vendor_name}</div>
                      <div className="text-2xs text-slate-400">{req.project_department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <CurrencyDisplay amount={req.amount} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {req.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold bg-slate-100 text-slate-800">
                        {req.requested_payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-2xs text-slate-500 whitespace-nowrap">
                      {formatTimeAgo(req.approved_at || req.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <CreditCard size={13} />
                          <span>Process Payment</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception / Timeout Reconciliation Section */}
      {failedList.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200/90 shadow-card overflow-hidden">
          <div className="p-4 bg-amber-50/50 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-700" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Transactions Requiring Reconciliation / Review ({failedList.length})
                </h3>
                <p className="text-2xs text-amber-800">
                  Provider timeouts and ambiguous gateway outcomes flagged with safe-retry lock
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status / Alert</th>
                  <th className="py-3 px-4 text-right">Reconciliation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {failedList.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigateTo('payment-detail', req.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {req.vendor_name}
                    </td>
                    <td className="py-3 px-4">
                      <CurrencyDisplay amount={req.amount} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {req.requested_payment_method}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReconcileRequest(req);
                        }}
                        className="px-2.5 py-1 rounded text-2xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300"
                      >
                        Reconcile Gateway
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. Process Payment Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onConfirm={handleExecutePayment}
        isLoading={isProcessing}
        title="Execute Payment Disbursement"
        confirmText="Initiate Disbursement"
        variant="primary"
        message={
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle size={14} className="text-amber-700 shrink-0" />
                <span>Double-Disbursement Safety Warning</span>
              </div>
              <p className="leading-snug text-2xs">
                Confirm that you want to initiate this disbursement. Repeated processing attempts may result in duplicate payouts to the vendor.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-bold text-slate-900">{selectedRequest?.vendor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900">
                  {selectedRequest && formatKES(selectedRequest.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="text-slate-900">{selectedRequest?.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="text-slate-900">{selectedRequest?.requested_payment_method}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-800 mb-1 text-2xs">
                Mock Provider Simulation Scenario:
              </label>
              <select
                value={mockOutcome}
                onChange={(e) => setMockOutcome(e.target.value as any)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="SUCCESS">Success (Generate Provider Ref & Complete Payment)</option>
                <option value="FAILED">Provider Failure (Insufficient Paybill float / Bank reject)</option>
                <option value="TIMEOUT_AMBIGUOUS">Gateway Timeout (Ambiguous state - test reconciliation)</option>
              </select>
            </div>
          </div>
        }
      />

      {/* 2. Reconciliation Action Modal */}
      <ConfirmationModal
        isOpen={!!reconcileRequest}
        onClose={() => setReconcileRequest(null)}
        onConfirm={() => handleExecuteReconciliation('CONFIRM_PAID')}
        isLoading={isProcessing}
        title="Transaction Status Reconciliation"
        confirmText="Confirm Bank Debit"
        cancelText="Close"
        variant="warning"
        message={
          <div className="space-y-3 text-xs">
            <p>
              Reconcile <strong className="font-mono text-slate-900">{reconcileRequest?.id}</strong> for{' '}
              <strong className="text-slate-900">{reconcileRequest?.vendor_name}</strong> (Amount:{' '}
              {reconcileRequest && formatKES(reconcileRequest.amount)}).
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => handleExecuteReconciliation('CONFIRM_PAID')}
                disabled={isProcessing}
                className="w-full text-left p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <div className="font-bold text-emerald-900">Option 1: Verify Paid on Statement</div>
                <div className="text-2xs text-emerald-700 mt-0.5">
                  Statement confirms disbursement completed. Update status to PAID.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteReconciliation('RESET_FOR_RETRY')}
                disabled={isProcessing}
                className="w-full text-left p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <div className="font-bold text-slate-900">Option 2: Safe Reset for Re-Attempt</div>
                <div className="text-2xs text-slate-600 mt-0.5">
                  Statement confirms no funds moved. Safely reset to APPROVED for re-processing.
                </div>
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
};
