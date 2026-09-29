import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { PaymentRequest, Approval, PaymentAttempt, AuditEvent } from '../../../types';
import { paymentsApi } from '../../../api/paymentsApi';
import { approvalsApi } from '../../../api/approvalsApi';
import { processingApi } from '../../../api/processingApi';
import { StatusBadge } from '../../common/StatusBadge';
import { ThresholdBadge } from '../../common/ThresholdBadge';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { StatusStepper } from './StatusStepper';
import { formatDateTime, formatDateOnly, formatTimeAgo, formatKES } from '../../../lib/formatters';
import {
  canUserApproveRequest,
  canUserRejectRequest,
  canUserProcessPayment,
  canUserEditDraft,
  canUserSubmitDraft,
} from '../../../lib/permissions';
import { Button } from '../../common/Button';
import { RejectModal } from '../../common/RejectModal';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { LoadingState } from '../../common/LoadingState';
import { ErrorState } from '../../common/ErrorState';
import {
  ArrowLeft,
  CheckSquare,
  XCircle,
  CreditCard,
  Send,
  Edit,
  FileText,
  UserCheck,
  ShieldCheck,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  Download,
  AlertTriangle,
  History,
  CheckCircle2,
  Lock,
  RefreshCw,
} from 'lucide-react';

export const PaymentRequestDetail: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedRequestId, navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Active Tab: 'overview' | 'approvals' | 'payment' | 'audit'
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'payment' | 'audit'>('overview');

  // Modal Action States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Mock processing simulation option
  const [mockOutcome, setMockOutcome] = useState<'SUCCESS' | 'FAILED' | 'TIMEOUT_AMBIGUOUS'>('SUCCESS');

  const loadDetails = async () => {
    if (!selectedRequestId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await paymentsApi.getPaymentRequest(selectedRequestId);
      setRequest(res.request);
      setApprovals(res.approvals);
      setAttempts(res.attempts);
      setAuditHistory(res.auditHistory);
    } catch (err: any) {
      console.error('Failed to load payment request detail:', err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [selectedRequestId, currentUser]);

  if (isLoading) {
    return <LoadingState type="page" text="Loading payment request details..." />;
  }

  if (notFound || !request) {
    return (
      <ErrorState
        status={404}
        title="Payment Request Not Found"
        message={`Payment request with ID "${selectedRequestId}" was not found or may have been deleted.`}
        onRetry={() => navigateTo('payments')}
      />
    );
  }

  const approveCheck = canUserApproveRequest(currentUser, request);
  const rejectCheck = canUserRejectRequest(currentUser, request);
  const processCheck = canUserProcessPayment(currentUser, request);
  const editCheck = canUserEditDraft(currentUser, request);
  const submitCheck = canUserSubmitDraft(currentUser, request);

  const isRequester =
    currentUser &&
    (request.requester_id === currentUser.id ||
      request.requester_email.toLowerCase() === currentUser.email.toLowerCase());

  // Action handlers
  const handleApprove = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      await approvalsApi.approvePaymentRequest(request.id, currentUser);
      showToast('success', 'Payment Approved', `${request.id} has been successfully approved.`);
      setIsApproveModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      showToast('error', 'Approval Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      await approvalsApi.rejectPaymentRequest(request.id, currentUser, reason);
      showToast('success', 'Request Rejected', `${request.id} was rejected.`);
      setIsRejectModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      showToast('error', 'Rejection Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      await paymentsApi.submitPaymentRequest(request.id, currentUser);
      showToast('success', 'Request Submitted', `${request.id} is now pending approval.`);
      await loadDetails();
    } catch (err: any) {
      showToast('error', 'Submission Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      const res = await processingApi.processPayment(request.id, currentUser, mockOutcome);
      if (res.attempt.status === 'SUCCESS') {
        showToast(
          'success',
          'Payment Disbursed Successfully',
          `Provider Ref: ${res.attempt.provider_reference}`
        );
      } else if (res.attempt.status === 'TIMEOUT_AMBIGUOUS') {
        showToast(
          'warning',
          'Payment Provider Timed Out',
          'Transaction status ambiguous. Please verify provider records before retrying.'
        );
      } else {
        showToast('error', 'Payment Failed', res.attempt.failure_reason || 'Provider declined disbursement.');
      }
      setIsProcessModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      showToast('error', 'Processing Error', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReconcile = async (resolution: 'CONFIRM_PAID' | 'RESET_FOR_RETRY') => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      await processingApi.reconcilePayment(request.id, currentUser, resolution);
      showToast(
        'success',
        'Reconciliation Recorded',
        resolution === 'CONFIRM_PAID'
          ? 'Transaction verified as debited and marked PAID.'
          : 'Transaction reset to APPROVED for safe retry.'
      );
      setIsReconcileModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      showToast('error', 'Reconciliation Failed', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Primary Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('payments')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to Payment Requests"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {request.id}
              </h2>
              <StatusBadge status={request.status} size="md" />
              <ThresholdBadge threshold={request.approval_threshold} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {request.vendor_name} • Invoice: {request.invoice_number} • Created {formatDateTime(request.created_at)}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons based on Role and Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Draft Actions */}
          {editCheck && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('payment-edit', request.id)}
              leftIcon={<Edit size={14} />}
            >
              Edit Draft
            </Button>
          )}

          {submitCheck && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitDraft}
              isLoading={isActionLoading}
              leftIcon={<Send size={14} />}
            >
              Submit for Approval
            </Button>
          )}

          {/* Pending Approval Actions */}
          {request.status === 'PENDING_APPROVAL' && (
            <>
              {rejectCheck.allowed && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsRejectModalOpen(true)}
                  leftIcon={<XCircle size={14} />}
                >
                  Reject
                </Button>
              )}

              {approveCheck.allowed ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setIsApproveModalOpen(true)}
                  leftIcon={<CheckSquare size={14} />}
                >
                  Approve Request
                </Button>
              ) : isRequester ? (
                <div
                  className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-2xs font-medium flex items-center gap-1.5"
                  title="Segregation of Duties: You cannot approve your own payment request."
                >
                  <Lock size={12} />
                  <span>Requester (Self-Approval Restricted)</span>
                </div>
              ) : null}
            </>
          )}

          {/* Finance Process Payment */}
          {processCheck.allowed && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsProcessModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              leftIcon={<CreditCard size={15} />}
            >
              Process Payment
            </Button>
          )}

          {/* Reconciliation trigger for Ambiguous / Failed transactions */}
          {request.status === 'FAILED' && (currentUser?.role === 'FINANCE' || currentUser?.role === 'ADMIN') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReconcileModalOpen(true)}
              className="text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
              leftIcon={<RefreshCw size={14} />}
            >
              Reconcile Gateway
            </Button>
          )}
        </div>
      </div>

      {/* Visual Workflow / Status Stepper */}
      <StatusStepper
        status={request.status}
        rejectionReason={request.rejection_reason}
        failureReason={attempts[0]?.failure_reason}
        submittedAt={request.submitted_at}
        approvedAt={request.approved_at}
        paidAt={request.paid_at}
      />

      {/* Flagship Amount & Vendor Header Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
            Total Requisition Amount
          </span>
          <div className="flex items-baseline gap-3">
            <CurrencyDisplay amount={request.amount} size="2xl" allowCopy />
            <span className="text-xs text-slate-500 font-mono">
              Via {request.requested_payment_method}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Purpose: <span className="font-semibold text-slate-900">{request.reason}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 text-xs">
          <div>
            <span className="text-slate-400 text-2xs block">Requester</span>
            <span className="font-semibold text-slate-900">{request.requester_name}</span>
            <span className="text-2xs text-slate-500 block">{request.requester_department}</span>
          </div>
          <div>
            <span className="text-slate-400 text-2xs block">Project / Dept</span>
            <span className="font-semibold text-slate-900">{request.project_department}</span>
          </div>
          <div>
            <span className="text-slate-400 text-2xs block">Payment Date</span>
            <span className="font-semibold text-slate-900 font-mono">
              {formatDateOnly(request.requested_payment_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={15} />
          <span>Overview Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 relative ${
            activeTab === 'approvals'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare size={15} />
          <span>Approval Matrix</span>
          {request.status === 'PENDING_APPROVAL' && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'payment'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard size={15} />
          <span>Disbursement & Attempts ({attempts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History size={15} />
          <span>Audit History ({auditHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Requisition Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Vendor Name</span>
                  <span className="font-semibold text-slate-900 text-sm">{request.vendor_name}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Invoice / Claim Reference</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {request.invoice_number}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Associated Project</span>
                  <span className="font-medium text-slate-900">{request.project_department}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Payment Method</span>
                  <span className="font-medium text-slate-900">{request.requested_payment_method}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Target Payment Date</span>
                  <span className="font-medium text-slate-900 font-mono">
                    {formatDateOnly(request.requested_payment_date)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Threshold Classification</span>
                  <ThresholdBadge threshold={request.approval_threshold} size="sm" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Reason for Payment</span>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
                  {request.reason}
                </p>
              </div>

              {request.supporting_notes && (
                <div>
                  <span className="text-slate-400 text-xs block mb-1">Supporting Notes</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {request.supporting_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Vendor Card & Supporting Doc */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Building2 size={14} />
                <span>Vendor Master Profile</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="font-bold text-slate-900 text-sm">{request.vendor_name}</div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Service Category:</span>
                  <span className="font-medium text-slate-800">Materials & Contracting</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Preferred Method:</span>
                  <span className="font-medium text-slate-800">{request.requested_payment_method}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-emerald-700">Active Vendor</span>
                </div>
              </div>
            </div>

            {/* Attached Invoice */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <FileText size={14} />
                <span>Supporting Invoice</span>
              </h4>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-rose-50 rounded text-rose-600 font-bold text-2xs shrink-0">
                    PDF
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-medium text-slate-900 truncate block">
                      {request.attachment_name || `${request.invoice_number}_Invoice.pdf`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {request.attachment_size || '1.8 MB'} • Verified
                    </span>
                  </div>
                </div>

                <a
                  href={`data:text/plain;charset=utf-8,ImaraWorks%20Payment%20Invoice%20Document%20for%20${request.id}`}
                  download={request.attachment_name || `${request.invoice_number}.txt`}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors shrink-0"
                  title="Download attachment"
                >
                  <Download size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Approval Matrix */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Approval Hierarchy & Sign-Off Matrix
                </h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Threshold: {request.amount > 50000 ? '> KES 50,000 (Requires Operations Manager + Finance Officer)' : '≤ KES 50,000 (Requires Operations Manager approval)'}
                </p>
              </div>
              <ThresholdBadge threshold={request.approval_threshold} size="md" />
            </div>

            {/* Multi-step Approval Chain Cards */}
            <div className="mt-6 space-y-4">
              {/* Step 1: Manager Sign-off */}
              {(() => {
                const step1 = approvals.find((a) => a.step_number === 1);
                const isStep1Approved = step1?.decision === 'APPROVED';
                const isStep1Rejected = step1?.decision === 'REJECTED';
                const isStep1Pending = !isStep1Approved && !isStep1Rejected;

                return (
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isStep1Approved
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isStep1Rejected
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isStep1Approved
                              ? 'bg-emerald-600 text-white'
                              : isStep1Rejected
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isStep1Approved ? <CheckCircle2 size={18} /> : isStep1Rejected ? <XCircle size={18} /> : '1'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Step 1: Operations Manager Approval
                          </h4>
                          <p className="text-2xs text-slate-500">
                            Required for all payment requisitions (Verifies delivery, BOQ, and site completion)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isStep1Approved && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={13} />
                            <span>Approved by {step1?.approver_name}</span>
                          </span>
                        )}
                        {isStep1Rejected && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                            <XCircle size={13} />
                            <span>Rejected by {step1?.approver_name}</span>
                          </span>
                        )}
                        {isStep1Pending && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                            <Clock size={13} />
                            <span>Pending Manager Decision</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {step1?.decision_timestamp && (
                      <div className="mt-3 pt-3 border-t border-slate-100 text-2xs text-slate-500 flex items-center justify-between">
                        <span>Decision Timestamp: {formatDateTime(step1.decision_timestamp)}</span>
                        {step1.comments && <span className="font-medium italic">"{step1.comments}"</span>}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Step 2: Finance Sign-off (if > 50,000 KES) */}
              {request.approval_threshold === 'MANAGER_AND_FINANCE' && (() => {
                const step2 = approvals.find((a) => a.step_number === 2);
                const isStep2Approved = step2?.decision === 'APPROVED';
                const isStep2Rejected = step2?.decision === 'REJECTED';
                const isStep2Pending = !isStep2Approved && !isStep2Rejected;

                return (
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isStep2Approved
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isStep2Rejected
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isStep2Approved
                              ? 'bg-emerald-600 text-white'
                              : isStep2Rejected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isStep2Approved ? <CheckCircle2 size={18} /> : isStep2Rejected ? <XCircle size={18} /> : '2'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Step 2: Finance Officer Secondary Approval
                          </h4>
                          <p className="text-2xs text-slate-500">
                            Mandatory threshold check for high-value claims exceeding KES 50,000
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isStep2Approved && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={13} />
                            <span>Approved by {step2?.approver_name}</span>
                          </span>
                        )}
                        {isStep2Rejected && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                            <XCircle size={13} />
                            <span>Rejected by {step2?.approver_name}</span>
                          </span>
                        )}
                        {isStep2Pending && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                            <Clock size={13} />
                            <span>{request.current_approval_step === 'FINANCE_STEP' ? 'Actionable by Finance' : 'Waiting for Step 1 completion'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {step2?.decision_timestamp && (
                      <div className="mt-3 pt-3 border-t border-slate-100 text-2xs text-slate-500 flex items-center justify-between">
                        <span>Decision Timestamp: {formatDateTime(step2.decision_timestamp)}</span>
                        {step2.comments && <span className="font-medium italic">"{step2.comments}"</span>}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Disbursement & Payment Attempts */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Payment Disbursement & Provider Attempts
                </h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Idempotent execution records with mock provider gateway references
                </p>
              </div>
              <StatusBadge status={request.status} size="sm" />
            </div>

            {attempts.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No payment disbursement attempts recorded yet.
                {request.status === 'APPROVED' && (
                  <p className="mt-1 text-slate-600 font-medium">
                    This request is APPROVED and waiting for a Finance Officer to process payment.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {attempts.map((att, idx) => (
                  <div
                    key={att.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          Attempt #{attempts.length - idx}: {att.id}
                        </span>
                        <span
                          className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                            att.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'TIMEOUT_AMBIGUOUS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </div>

                      <div className="text-2xs font-mono text-slate-500">
                        Idempotency: {att.idempotency_key}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-2xs block">Disbursed Amount</span>
                        <CurrencyDisplay amount={att.amount} size="sm" />
                      </div>
                      <div>
                        <span className="text-slate-400 text-2xs block">Provider Channel</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {att.provider.replace('MOCK_', '')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-2xs block">Provider Reference</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {att.provider_reference || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-2xs block">Initiated By</span>
                        <span className="text-slate-800">{att.initiated_by_name}</span>
                      </div>
                    </div>

                    {att.failure_reason && (
                      <div className="p-2.5 rounded bg-rose-50 text-rose-800 text-xs border border-rose-200">
                        <strong>Failure Reason:</strong> {att.failure_reason}
                      </div>
                    )}

                    {att.reconciliation_notes && (
                      <div className="p-2.5 rounded bg-amber-50 text-amber-900 text-xs border border-amber-200">
                        <strong>Reconciliation Note:</strong> {att.reconciliation_notes}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Initiated: {formatDateTime(att.initiated_at)}</span>
                      {att.completed_at && <span>Completed: {formatDateTime(att.completed_at)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Audit History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
          <div className="pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-sm font-bold text-slate-900">
              Tamper-Evident Chronological Audit Log
            </h3>
            <p className="text-2xs text-slate-500 mt-0.5">
              Immutable history of all business actions, user decisions, and system events for {request.id}
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {auditHistory.map((event) => (
              <div key={event.id} className="relative flex items-start gap-4 text-xs group">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-200" />
                <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900">{event.action}</span>
                    <span className="text-2xs font-mono text-slate-400">
                      {formatDateTime(event.timestamp)} ({formatTimeAgo(event.timestamp)})
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{event.description}</p>

                  <div className="mt-2 text-2xs text-slate-500 font-medium flex items-center gap-2">
                    <span>Actor: <strong>{event.actor_name}</strong></span>
                    <span>•</span>
                    <span className="uppercase text-slate-400 font-mono">{event.actor_role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modals */}
      {/* 1. Approval Modal */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        isLoading={isActionLoading}
        title="Approve Payment Request"
        confirmText="Confirm Approval"
        variant="primary"
        message={
          <div>
            <p>
              Are you sure you want to approve request <strong className="font-mono text-slate-900">{request.id}</strong> for{' '}
              <strong className="text-slate-900">{formatKES(request.amount)}</strong> to <strong className="text-slate-900">{request.vendor_name}</strong>?
            </p>
            <p className="text-2xs text-slate-500 mt-2">
              {request.amount > 50000 && request.current_approval_step === 'MANAGER_STEP'
                ? 'Since this amount exceeds KES 50,000, your approval will advance this request to Step 2 (Finance Officer Approval).'
                : 'This approval will clear the request for Finance disbursement.'}
            </p>
          </div>
        }
      />

      {/* 2. Rejection Modal with Mandatory Reason */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onReject={handleReject}
        request={request}
        isLoading={isActionLoading}
      />

      {/* 3. Finance Process Payment Confirmation Modal with Mock Provider Selector */}
      <ConfirmationModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        onConfirm={handleProcessPayment}
        isLoading={isActionLoading}
        title="Process Payment Disbursement"
        confirmText="Initiate Payment"
        variant="primary"
        message={
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle size={14} className="text-amber-700 shrink-0" />
                <span>Double-Disbursement Prevention Warning</span>
              </div>
              <p className="leading-snug">
                Confirm that you want to initiate this payment. Repeated processing attempts may result in duplicate payments to the contractor.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-bold text-slate-900">{request.vendor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900">{formatKES(request.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice No:</span>
                <span className="text-slate-900">{request.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="text-slate-900">{request.requested_payment_method}</span>
              </div>
            </div>

            {/* Mock Provider Outcome Choice for Testing & Demoing edge cases */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-800 mb-1.5">
                Mock Provider Simulation Mode:
              </label>
              <select
                value={mockOutcome}
                onChange={(e) => setMockOutcome(e.target.value as any)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white"
              >
                <option value="SUCCESS">Success (Generate Provider Ref & Complete Payment)</option>
                <option value="FAILED">Provider Rejection (Insufficient Paybill float / Bank reject)</option>
                <option value="TIMEOUT_AMBIGUOUS">Provider Timeout (HTTP 504 Ambiguous state)</option>
              </select>
            </div>
          </div>
        }
      />

      {/* 4. Safe Reconciliation Modal for Ambiguous Timeouts */}
      <ConfirmationModal
        isOpen={isReconcileModalOpen}
        onClose={() => setIsReconcileModalOpen(false)}
        onConfirm={() => handleReconcile('CONFIRM_PAID')}
        isLoading={isActionLoading}
        title="Gateway Status Reconciliation Desk"
        confirmText="Confirm Paid on Bank Log"
        cancelText="Close"
        variant="warning"
        message={
          <div className="space-y-3 text-xs">
            <p>
              This transaction encountered a gateway timeout or unconfirmed state. Choose how to resolve this record:
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => handleReconcile('CONFIRM_PAID')}
                disabled={isActionLoading}
                className="w-full text-left p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <div className="font-bold text-emerald-900">Option A: Confirm Debit on Bank Portal</div>
                <div className="text-2xs text-emerald-700 mt-0.5">
                  If bank statement shows money left the account, mark as PAID with verified reference.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleReconcile('RESET_FOR_RETRY')}
                disabled={isActionLoading}
                className="w-full text-left p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <div className="font-bold text-slate-900">Option B: Safe Reset for Re-Processing</div>
                <div className="text-2xs text-slate-600 mt-0.5">
                  If bank statement confirms no money moved, reset status to APPROVED so it can be re-disbursed safely.
                </div>
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
};
