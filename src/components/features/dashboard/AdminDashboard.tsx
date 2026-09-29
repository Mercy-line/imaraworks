import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { UserAccount, Vendor, PaymentRequest, AuditEvent } from '../../../types';
import { usersApi } from '../../../api/usersApi';
import { vendorsApi } from '../../../api/vendorsApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { auditApi } from '../../../api/auditApi';
import { StatCard } from '../../common/StatCard';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatTimeAgo, formatDateTime } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { LoadingState } from '../../common/LoadingState';
import {
  ShieldAlert,
  Users,
  Building2,
  Receipt,
  DollarSign,
  ScrollText,
  ArrowUpRight,
  Server,
  Activity,
  CheckCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setIsLoading(true);
        const [u, v, r, a] = await Promise.all([
          usersApi.getUsers(),
          vendorsApi.getVendors(),
          paymentsApi.getPaymentRequests(),
          auditApi.getAuditEvents(),
        ]);
        setUsers(u);
        setVendors(v);
        setRequests(r);
        setAuditLogs(a);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, [currentUser]);

  if (isLoading) {
    return <LoadingState type="page" text="Loading Administrator Control Center..." />;
  }

  const activeUsersCount = users.filter((u) => u.status === 'ACTIVE').length;
  const totalPaidKes = requests
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-2xs font-semibold border border-purple-500/30 mb-2">
            <ShieldAlert size={12} />
            <span>System Governance & Governance Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Administrator Center — {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitor organizational compliance, configure roles & permissions, inspect immutable audit trails, and maintain vendor registries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="md"
            onClick={() => navigateTo('users')}
            className="bg-purple-600 hover:bg-purple-500 text-white border-none shadow-md"
            leftIcon={<Users size={16} />}
          >
            Manage User Accounts
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle={`${activeUsersCount} active accounts`}
          icon={<Users size={20} />}
          accentColor="purple"
        />
        <StatCard
          title="Registered Vendors"
          value={vendors.length}
          subtitle="Contractors & Suppliers"
          icon={<Building2 size={20} />}
          accentColor="blue"
        />
        <StatCard
          title="Payment Requests"
          value={requests.length}
          subtitle="System lifetime total"
          icon={<Receipt size={20} />}
          accentColor="amber"
        />
        <StatCard
          title="Total Paid Out"
          value={<CurrencyDisplay amount={totalPaidKes} size="md" />}
          subtitle="Cleared disbursements"
          icon={<DollarSign size={20} />}
          accentColor="emerald"
        />
      </div>

      {/* Main Grid: Immutable Audit Stream + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Audit Trail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Security & Audit Log</h3>
              <p className="text-2xs text-slate-500 mt-0.5">
                Immutable, chronological log of critical approvals, rejections, and payment disbursements
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('audit')}
              rightIcon={<ArrowUpRight size={13} />}
            >
              Full Audit Log
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity / ID</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditLogs.slice(0, 6).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-2xs text-slate-500 whitespace-nowrap font-mono">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.actor_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">{log.actor_role}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-2xs text-slate-600">
                      {log.request_code || log.entity_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={log.description}>
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: System Information & Role Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Server size={16} className="text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">System Architecture Info</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Backend Domain:</span>
                <span className="font-mono font-semibold text-slate-800">Django Modular Monolith</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-mono font-semibold text-slate-800">PostgreSQL (DRF API)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Payment Provider:</span>
                <span className="font-mono font-semibold text-emerald-700">Mock Provider Active</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Threshold Rule:</span>
                <span className="font-semibold text-slate-800">KES 50,000 Boundary</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">System Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle size={12} />
                  <span>Healthy / Operational</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Quick Admin Shortcuts
            </h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => navigateTo('users')}
                leftIcon={<Users size={14} />}
              >
                Manage Company Users & Roles
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => navigateTo('vendors')}
                leftIcon={<Building2 size={14} />}
              >
                Review Master Vendor Registry
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => navigateTo('reports')}
                leftIcon={<Activity size={14} />}
              >
                Company-wide Financial Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
