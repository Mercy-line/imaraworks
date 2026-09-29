import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { PaymentRequest, AuditEvent } from '../../../types';
import { paymentsApi } from '../../../api/paymentsApi';
import { auditApi } from '../../../api/auditApi';
import { StatCard } from '../../common/StatCard';
import { StatusBadge } from '../../common/StatusBadge';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatDateTime, formatDateOnly, formatTimeAgo } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { LoadingState } from '../../common/LoadingState';
import {
  Receipt,
  Clock,
  CheckCircle2,
  CheckCheck,
  PlusCircle,
  ArrowUpRight,
  FileEdit,
  AlertCircle,
  Activity,
  Calendar,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();

  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [activities, setActivities] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const allRequests = await paymentsApi.getPaymentRequests();
        // Employee sees own requests or all company requests
        const myRequests = allRequests.filter(
          (r) => r.requester_id === currentUser?.id || r.requester_email === currentUser?.email
        );
        setRequests(myRequests.length ? myRequests : allRequests.slice(0, 5));

        const recentAudits = await auditApi.getAuditEvents();
        setActivities(recentAudits.slice(0, 6));
      } catch (err) {
        console.error('Failed to load employee dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (isLoading) {
    return <LoadingState type="page" text="Loading your payment requests..." />;
  }

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING_APPROVAL' || r.status === 'SUBMITTED').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const paidCount = requests.filter((r) => r.status === 'PAID').length;
  const draftCount = requests.filter((r) => r.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner + New Request CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-card relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-2xs font-semibold border border-amber-500/30 mb-2">
            <span>Employee Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Create contractor payment requisitions, submit site invoices, and track your approval milestones in real time.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Button
            size="lg"
            onClick={() => navigateTo('payment-create')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-none shadow-md"
            leftIcon={<PlusCircle size={18} className="text-slate-950" />}
          >
            + New Payment Request
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={totalCount}
          subtitle="All created records"
          icon={<Receipt size={20} />}
          accentColor="slate"
        />
        <StatCard
          title="Awaiting Approval"
          value={pendingCount}
          subtitle="In management review"
          icon={<Clock size={20} />}
          accentColor="amber"
          highlight={pendingCount > 0}
        />
        <StatCard
          title="Approved"
          value={approvedCount}
          subtitle="Ready for disbursement"
          icon={<CheckCircle2 size={20} />}
          accentColor="blue"
        />
        <StatCard
          title="Disbursed / Paid"
          value={paidCount}
          subtitle="Cleared by Finance"
          icon={<CheckCheck size={20} />}
          accentColor="emerald"
        />
      </div>

      {/* Main Grid: Recent Requests Table + Recent Updates Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Payment Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Payment Requests</h3>
              <p className="text-2xs text-slate-500 mt-0.5">
                Track status and approval progression of your payment requests
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('payments')}
              rightIcon={<ArrowUpRight size={13} />}
            >
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Project / Dept</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No payment requests found. Click "+ New Payment Request" to create one.
                    </td>
                  </tr>
                ) : (
                  requests.slice(0, 6).map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => navigateTo('payment-detail', req.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 group-hover:text-slate-950">
                        {req.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 truncate max-w-[150px]">
                          {req.vendor_name}
                        </div>
                        <div className="text-2xs text-slate-400 font-mono">
                          {req.invoice_number}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <CurrencyDisplay amount={req.amount} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                        {req.project_department}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('payment-detail', req.id);
                          }}
                          className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 group-hover:bg-slate-200 transition-colors"
                        >
                          <span>Track</span>
                          <ArrowUpRight size={11} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Activity size={16} className="text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent System Updates</h3>
            </div>

            <div className="space-y-3.5">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-tight truncate">
                      {act.action}
                    </p>
                    <p className="text-2xs text-slate-500 mt-0.5 line-clamp-2">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-2xs text-slate-400">
              Company policy: Payments ≤ KES 50k require 1 Manager; &gt; KES 50k require Manager + Finance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
