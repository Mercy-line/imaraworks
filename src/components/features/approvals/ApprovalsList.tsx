import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { PaymentRequest } from '../../../types';
import { approvalsApi } from '../../../api/approvalsApi';
import { StatusBadge } from '../../common/StatusBadge';
import { ThresholdBadge } from '../../common/ThresholdBadge';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatTimeAgo, formatDateOnly, formatDateTime, formatKES } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { RejectModal } from '../../common/RejectModal';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { EmptyState } from '../../common/EmptyState';
import { LoadingState } from '../../common/LoadingState';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Clock,
  Building2,
} from 'lucide-react';

export const ApprovalsList: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [pendingRequests, setPendingRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Action Modals
  const [selectedForApprove, setSelectedForApprove] = useState<PaymentRequest | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<PaymentRequest | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadApprovals = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const list = await approvalsApi.getPendingApprovals(currentUser);
      setPendingRequests(list);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [currentUser]);

  const handleApprove = async () => {
    if (!selectedForApprove || !currentUser) return;
    setIsActionLoading(true);
    try {
      await approvalsApi.approvePaymentRequest(selectedForApprove.id, currentUser);
      showToast('success', 'Request Approved', `${selectedForApprove.id} has been approved.`);
      setSelectedForApprove(null);
      await loadApprovals();
    } catch (err: any) {
      showToast('error', 'Approval Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedForReject || !currentUser) return;
    setIsActionLoading(true);
    try {
      await approvalsApi.rejectPaymentRequest(selectedForReject.id, currentUser, reason);
      showToast('success', 'Request Rejected', `${selectedForReject.id} has been rejected.`);
      setSelectedForReject(null);
      await loadApprovals();
    } catch (err: any) {
      showToast('error', 'Rejection Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState type="table-skeleton" rows={5} />;
  }

  const isFinance = currentUser?.role === 'FINANCE';
  const roleTitle = isFinance ? 'Finance Sign-Off Desk (Step 2/2)' : 'Manager Approval Desk (Step 1)';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{roleTitle}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              {pendingRequests.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isFinance
              ? 'Authorizing secondary approval for high-value contractor requisitions (> KES 50,000)'
              : 'Reviewing initial operations claims before financial disbursement'}
          </p>
        </div>
      </div>

      {/* Approvals Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-2xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Vendor & Claim</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Requester</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Threshold</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8">
                    <EmptyState
                      icon="completed"
                      title="No requests awaiting your approval"
                      description="Your approval queue is completely clear. You will receive real-time notifications when new contractor claims are submitted."
                    />
                  </td>
                </tr>
              ) : (
                pendingRequests.map((req) => (
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
                      <div className="text-2xs text-slate-400 font-mono">Inv: {req.invoice_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <CurrencyDisplay amount={req.amount} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{req.requester_name}</div>
                      <div className="text-2xs text-slate-400">{req.requester_department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                      {req.project_department}
                    </td>
                    <td className="py-3.5 px-4">
                      <ThresholdBadge threshold={req.approval_threshold} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-2xs text-slate-500 whitespace-nowrap">
                      {formatTimeAgo(req.submitted_at || req.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedForReject(req)}
                          className="px-2.5 py-1 rounded text-2xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedForApprove(req)}
                          className="px-3 py-1 rounded text-2xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('payment-detail', req.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="Inspect complete details"
                        >
                          <Eye size={14} />
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

      {/* Confirmation & Reject Modals */}
      <ConfirmationModal
        isOpen={!!selectedForApprove}
        onClose={() => setSelectedForApprove(null)}
        onConfirm={handleApprove}
        isLoading={isActionLoading}
        title="Approve Payment Requisition"
        variant="primary"
        confirmText="Confirm Approval"
        message={
          <div>
            <p>
              Confirm approval for <strong className="font-mono text-slate-900">{selectedForApprove?.id}</strong> for{' '}
              <strong className="text-slate-900">{selectedForApprove?.vendor_name}</strong>?
            </p>
            <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedForApprove && formatKES(selectedForApprove.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Threshold:</span>
                <span className="font-medium text-slate-700">
                  {selectedForApprove?.amount && selectedForApprove.amount > 50000
                    ? isFinance ? 'Final Approval -> Cleared for Disbursement' : 'Step 1 -> Advancing to Step 2 Finance'
                    : 'Final Approval -> Cleared for Disbursement'}
                </span>
              </div>
            </div>
          </div>
        }
      />

      <RejectModal
        isOpen={!!selectedForReject}
        onClose={() => setSelectedForReject(null)}
        onReject={handleReject}
        request={selectedForReject}
        isLoading={isActionLoading}
      />
    </div>
  );
};
