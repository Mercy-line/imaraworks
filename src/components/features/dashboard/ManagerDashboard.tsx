import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { PaymentRequest } from '../../../types';
import { approvalsApi } from '../../../api/approvalsApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { StatCard } from '../../common/StatCard';
import { StatusBadge } from '../../common/StatusBadge';
import { ThresholdBadge } from '../../common/ThresholdBadge';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatTimeAgo, formatDateOnly } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { RejectModal } from '../../common/RejectModal';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { LoadingState } from '../../common/LoadingState';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [pendingRequests, setPendingRequests] = useState<PaymentRequest[]>([]);
  const [allRequests, setAllRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Action Modals
  const [selectedForApprove, setSelectedForApprove] = useState<PaymentRequest | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<PaymentRequest | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const pending = await approvalsApi.getPendingApprovals(currentUser);
      setPendingRequests(pending);

      const all = await paymentsApi.getPaymentRequests();
      setAllRequests(all);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleConfirmApprove = async () => {
    if (!selectedForApprove || !currentUser) return;
    setIsActionLoading(true);
    try {
      await approvalsApi.approvePaymentRequest(selectedForApprove.id, currentUser);
      showToast('success', 'Request Approved', `${selectedForApprove.id} has been approved.`);
      setSelectedForApprove(null);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Approval Failed', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedForReject || !currentUser) return;
    setIsActionLoading(true);
    try {
      await approvalsApi.rejectPaymentRequest(selectedForReject.id, currentUser, reason);
      showToast('success', 'Request Rejected', `${selectedForReject.id} has been rejected.`);
      setSelectedForReject(null);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Rejection Failed', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState type="page" text="Loading manager approval queue..." />;
  }

  const awaitingCount = pendingRequests.length;
  const approvedCount = allRequests.filter((r) => r.status === 'APPROVED' || r.status === 'PAID').length;
  const rejectedCount = allRequests.filter((r) => r.status === 'REJECTED').length;
  const totalPending = allRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-2xs font-semibold border border-amber-500/30 mb-2">
            <CheckSquare size={12} />
            <span>Management & Approval Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manager Portal — {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Review site contractor invoices, verify bill of quantities, and authorize payments within operational thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="outline"
            onClick={() => navigateTo('approvals')}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            Open Approvals Desk ({awaitingCount})
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Awaiting My Approval"
          value={awaitingCount}
          subtitle="Requires your review"
          icon={<Clock size={20} />}
          accentColor="amber"
          highlight={awaitingCount > 0}
        />
        <StatCard
          title="Approved (All Time)"
          value={approvedCount}
          subtitle="Passed review"
          icon={<CheckCircle2 size={20} />}
          accentColor="emerald"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedCount}
          subtitle="Halted with reason"
          icon={<XCircle size={20} />}
          accentColor="rose"
        />
        <StatCard
          title="Total In Review"
          value={totalPending}
          subtitle="Company wide"
          icon={<FileCheck size={20} />}
          accentColor="blue"
        />
      </div>

      {/* Primary Section: Requests Awaiting Approval */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Requests Awaiting Your Approval</h3>
              {awaitingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-2xs font-bold">
                  {awaitingCount} Actionable
                </span>
              )}
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">
              Review invoice details, verify delivery, and authorize disbursement
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Vendor & Invoice</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Project / Dept</th>
                <th className="py-3 px-4">Threshold Rule</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                      <p className="text-2xs text-slate-400 mt-0.5">
                        You have no pending requests requiring manager decision right now.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigateTo('payment-detail', req.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{req.vendor_name}</div>
                      <div className="text-2xs text-slate-400 font-mono">{req.invoice_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <CurrencyDisplay amount={req.amount} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{req.requester_name}</div>
                      <div className="text-2xs text-slate-400">{req.requester_department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                      {req.project_department}
                    </td>
                    <td className="py-3.5 px-4">
                      <ThresholdBadge threshold={req.approval_threshold} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-2xs">
                      {formatTimeAgo(req.submitted_at || req.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedForReject(req)}
                          className="px-2 py-1 rounded text-2xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedForApprove(req)}
                          className="px-2.5 py-1 rounded text-2xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('payment-detail', req.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                          title="Inspect complete details"
                        >
                          <ArrowRight size={14} />
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
        onConfirm={handleConfirmApprove}
        isLoading={isActionLoading}
        title="Approve Payment Request"
        variant="primary"
        confirmText="Confirm Approval"
        message={
          <div>
            <p>
              Are you sure you want to approve{' '}
              <strong className="text-slate-900 font-mono">{selectedForApprove?.id}</strong> for{' '}
              <strong className="text-slate-900">{selectedForApprove?.vendor_name}</strong>?
            </p>
            <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-semibold">{selectedForApprove && CurrencyDisplay({ amount: selectedForApprove.amount, size: 'sm' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Stage:</span>
                <span className="font-medium text-slate-700">
                  {selectedForApprove?.amount && selectedForApprove.amount > 50000
                    ? 'Step 2: Finance Officer Approval'
                    : 'Ready for Disbursement'}
                </span>
              </div>
            </div>
          </div>
        }
      />

      <RejectModal
        isOpen={!!selectedForReject}
        onClose={() => setSelectedForReject(null)}
        onReject={handleConfirmReject}
        request={selectedForReject}
        isLoading={isActionLoading}
      />
    </div>
  );
};
