import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import {
  FinancialMetrics,
  ProjectBreakdown,
  StatusBreakdown,
  MonthlyTrend,
  PaymentMethodBreakdown,
  PaymentRequest,
} from '../../../types';
import { reportsApi } from '../../../api/reportsApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { StatCard } from '../../common/StatCard';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatKES, formatCompactKES } from '../../../lib/formatters';
import { exportToCsv } from '../../../lib/utils';
import { Button } from '../../common/Button';
import { LoadingState } from '../../common/LoadingState';
import {
  BarChart3,
  Download,
  DollarSign,
  Clock,
  AlertTriangle,
  Receipt,
  TrendingUp,
  CreditCard,
  Building,
  Layers,
  PieChart,
} from 'lucide-react';

export const ReportsOverview: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();

  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [projects, setProjects] = useState<ProjectBreakdown[]>([]);
  const [statuses, setStatuses] = useState<StatusBreakdown[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [methods, setMethods] = useState<PaymentMethodBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setIsLoading(true);
        const [m, p, s, t, meth] = await Promise.all([
          reportsApi.getFinancialMetrics(),
          reportsApi.getProjectBreakdown(),
          reportsApi.getStatusBreakdown(),
          reportsApi.getMonthlyTrends(),
          reportsApi.getPaymentMethodBreakdown(),
        ]);
        setMetrics(m);
        setProjects(p);
        setStatuses(s);
        setTrends(t);
        setMethods(meth);
      } catch (err) {
        console.error('Failed to load reporting data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportReport = () => {
    const data = projects.map((p) => ({
      Project: p.project,
      'Total Amount (KES)': p.total_amount,
      'Requests Count': p.count,
      'Share %': `${p.percentage}%`,
    }));
    exportToCsv(`ImaraWorks_Project_Expenditure_Report_${new Date().toISOString().split('T')[0]}.csv`, data);
  };

  if (isLoading || !metrics) {
    return <LoadingState type="page" text="Synthesizing financial analytics & project disbursements..." />;
  }

  const maxTrendAmount = Math.max(...trends.map((t) => Math.max(t.paid_amount, t.submitted_amount)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial Operations & Expenditure Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management reporting on capital disbursements, approval bottlenecks, and project allocations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportReport}
          leftIcon={<Download size={14} />}
        >
          Export Summary CSV
        </Button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Capital Paid"
          value={<CurrencyDisplay amount={metrics.total_paid_kes} size="md" />}
          subtitle="Disbursed to date"
          icon={<DollarSign size={20} />}
          accentColor="emerald"
        />
        <StatCard
          title="Pending Approvals"
          value={<CurrencyDisplay amount={metrics.pending_approvals_kes} size="md" />}
          subtitle={`${metrics.pending_approvals_count} requests in pipeline`}
          icon={<Clock size={20} />}
          accentColor="amber"
        />
        <StatCard
          title="Failed / Ambiguous"
          value={<CurrencyDisplay amount={metrics.failed_payments_kes} size="md" />}
          subtitle={`${metrics.failed_payments_count} transactions flagged`}
          icon={<AlertTriangle size={20} />}
          accentColor="rose"
        />
        <StatCard
          title="Total Requisitions"
          value={metrics.total_requests_count}
          subtitle={`Avg approval: ${metrics.average_approval_hours} hrs`}
          icon={<Receipt size={20} />}
          accentColor="blue"
        />
      </div>

      {/* Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expenditure by Construction Project</h3>
              <p className="text-2xs text-slate-500">Capital distribution across active sites</p>
            </div>
            <Building size={16} className="text-slate-400" />
          </div>

          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.project} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                    {p.project}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-2xs">{p.count} claims</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatKES(p.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(p.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Disbursement vs Requisition Trends</h3>
              <p className="text-2xs text-slate-500">Submitted value vs cleared disbursements (KES)</p>
            </div>
            <TrendingUp size={16} className="text-slate-400" />
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-end gap-4 text-2xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-900 inline-block" />
                <span className="text-slate-700">Paid Out</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                <span className="text-slate-700">Requisitioned</span>
              </div>
            </div>

            <div className="space-y-4">
              {trends.map((t) => {
                const paidPct = (t.paid_amount / maxTrendAmount) * 100;
                const reqPct = (t.submitted_amount / maxTrendAmount) * 100;

                return (
                  <div key={t.month} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{t.month}</span>
                      <span className="font-mono text-2xs text-slate-500">
                        Paid: {formatCompactKES(t.paid_amount)} | Req: {formatCompactKES(t.submitted_amount)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-slate-900 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(paidPct, 3)}%` }}
                        />
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(reqPct, 3)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Payment Methods & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Channel Distribution</h3>
              <p className="text-2xs text-slate-500">Corporate M-Pesa vs Electronic Bank Wire</p>
            </div>
            <CreditCard size={16} className="text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {methods.map((m) => (
              <div
                key={m.method}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{m.method}</span>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {m.count} txns
                  </span>
                </div>
                <div className="font-mono font-extrabold text-lg text-slate-900">
                  {formatKES(m.total_amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lifecycle State Breakdown</h3>
              <p className="text-2xs text-slate-500">Active distribution across all 8 states</p>
            </div>
            <PieChart size={16} className="text-slate-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {statuses.map((s) => (
              <div
                key={s.status}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-center"
              >
                <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {s.status.replace('_', ' ')}
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {s.count}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {formatCompactKES(s.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
