import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { PaymentRequest, PaymentAttempt } from '../../../types';
import { paymentsApi } from '../../../api/paymentsApi';
import { processingApi } from '../../../api/processingApi';
import { StatCard } from '../../common/StatCard';
import { StatusBadge } from '../../common/StatusBadge';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatTimeAgo, formatDateTime } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { LoadingState } from '../../common/LoadingState';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Building,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [approvedRequests, setApprovedRequests] = useState<PaymentRequest[]>([]);
  const [financePending, setFinancePending] = useState<PaymentRequest[]>([]);
  const [failedRequests, setFailedRequests] = useState<PaymentRequest[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<PaymentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const allRequests = await paymentsApi.getPaymentRequests();

      // Ready for processing
      setApprovedRequests(allRequests.filter((r) => r.status === 'APPROVED'));

      // Awaiting finance approval step (>50k)
      setFinancePending(
        allRequests.filter(
          (r) => r.status === 'PENDING_APPROVAL' && r.current_approval_step === 'FINANCE_STEP'
        )
      );

      // Failed / Ambiguous
      setFailedRequests(allRequests.filter((r) => r.status === 'FAILED'));

      // Attempts
      const attempts = await processingApi.getPaymentAttempts('');
      setRecentAttempts(attempts.slice(0, 6));
    } catch (err) {
      console.error('Failed to load finance dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (isLoading) {
    return <LoadingState type="page" text="Loading Finance operations portal..." />;
  }

  const readyCount = approvedRequests.length;
  const awaitingFinanceCount = financePending.length;
  const failedCount = failedRequests.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-2xs font-semibold border border-emerald-500/30 mb-2">
            <ShieldCheck size={12} />
            <span>Treasury & Disbursement Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Finance Operations — {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Execute batch payments, audit provider references (M-Pesa & Bank Wire), and reconcile gateway transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="md"
            onClick={() => navigateTo('processing')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md"
            leftIcon={<CreditCard size={16} />}
          >
            Disbursement Queue ({readyCount})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ready for Processing"
          value={readyCount}
          subtitle="Approved requests"
          icon={<CreditCard size={20} />}
          accentColor="emerald"
          highlight={readyCount > 0}
        />
        <StatCard
          title="Awaiting Finance Approval"
          value={awaitingFinanceCount}
          subtitle="> KES 50k secondary review"
          icon={<Clock size={20} />}
          accentColor="amber"
          highlight={awaitingFinanceCount > 0}
        />
        <StatCard
          title="Failed / Ambiguous"
          value={failedCount}
          subtitle="Requires reconciliation"
          icon={<AlertTriangle size={20} />}
          accentColor="rose"
          highlight={failedCount > 0}
        />
        <StatCard
          title="Recent Attempts"
          value={recentAttempts.length}
          subtitle="Disbursements logged"
          icon={<CheckCheck size={20} />}
          accentColor="blue"
        />
      </div>

      {/* Main Grid: Ready for Processing Queue + Recent Provider Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Processing Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Payment Disbursement Queue (Approved)
              </h3>
              <p className="text-2xs text-slate-500 mt-0.5">
                Approved contractor claims verified and cleared for bank / M-Pesa execution
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('processing')}
            >
              Open Full Queue
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Approved Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {approvedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No approved requests waiting for disbursement at this moment.
                    </td>
                  </tr>
                ) : (
                  approvedRequests.slice(0, 5).map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => navigateTo('payment-detail', req.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {req.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{req.vendor_name}</div>
                        <div className="text-2xs text-slate-400 font-mono">{req.invoice_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <CurrencyDisplay amount={req.amount} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-slate-100 text-slate-700">
                          {req.requested_payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-2xs text-slate-500">
                        {formatTimeAgo(req.approved_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('payment-detail', req.id);
                          }}
                          className="inline-flex items-center gap-1 text-2xs font-bold text-white px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 shadow-2xs"
                        >
                          <span>Process</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Recent Payment Attempts / Provider References */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Provider Transactions</h3>
              <span className="text-2xs text-slate-400 font-mono">Mock Gateway</span>
            </div>

            <div className="space-y-3">
              {recentAttempts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No payment attempts logged.</p>
              ) : (
                recentAttempts.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => navigateTo('payment-detail', att.payment_request_id)}
                    className="p-2.5 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                      <span>{att.payment_request_id}</span>
                      <CurrencyDisplay amount={att.amount} size="sm" />
                    </div>

                    <div className="flex items-center justify-between mt-1 text-2xs">
                      <span className="text-slate-500">{att.provider.replace('MOCK_', '')}</span>
                      {att.status === 'SUCCESS' ? (
                        <span className="text-emerald-700 font-semibold font-mono">
                          {att.provider_reference}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium">
                          {att.status === 'TIMEOUT_AMBIGUOUS' ? 'Timeout (Ambiguous)' : 'Failed'}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>By {att.initiated_by_name}</span>
                      <span>{formatTimeAgo(att.initiated_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigateTo('reports')}
            >
              View Full Financial Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
