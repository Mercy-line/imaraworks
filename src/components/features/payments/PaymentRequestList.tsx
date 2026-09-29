import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { PaymentRequest, PaymentStatus, PaymentMethod, Vendor, UserAccount } from '../../../types';
import { paymentsApi } from '../../../api/paymentsApi';
import { vendorsApi } from '../../../api/vendorsApi';
import { usersApi } from '../../../api/usersApi';
import { StatusBadge } from '../../common/StatusBadge';
import { ThresholdBadge } from '../../common/ThresholdBadge';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { formatDateTime, formatDateOnly, formatTimeAgo, formatKES } from '../../../lib/formatters';
import { exportToCsv } from '../../../lib/utils';
import { Button } from '../../common/Button';
import { EmptyState } from '../../common/EmptyState';
import { LoadingState } from '../../common/LoadingState';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const PROJECTS = [
  'ALL',
  'Kilimani Plaza Commercial Build',
  'Riverside Luxury Residences',
  'Athi River Warehouse Phase 2',
  'Tatu City Industrial Park',
  'Westlands Corporate Tower',
  'Head Office Operations',
  'Plant & Equipment Fleet',
];

const STATUSES: (PaymentStatus | 'ALL')[] = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'PENDING_APPROVAL',
  'APPROVED',
  'PROCESSING',
  'PAID',
  'REJECTED',
  'FAILED',
];

export const PaymentRequestList: React.FC = () => {
  const { currentUser } = useAuth();
  const { searchQuery, setSearchQuery, navigateTo } = useNavigation();

  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [requesterFilter, setRequesterFilter] = useState<string>('ALL');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof PaymentRequest>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [r, v, u] = await Promise.all([
        paymentsApi.getPaymentRequests(),
        vendorsApi.getVendors(),
        usersApi.getUsers(),
      ]);
      setRequests(r);
      setVendors(v);
      setUsers(u);
    } catch (err) {
      console.error('Failed to load payment requests list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered and sorted dataset
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Global text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.id.toLowerCase().includes(q) ||
          r.vendor_name.toLowerCase().includes(q) ||
          r.invoice_number.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.project_department.toLowerCase().includes(q) ||
          r.requester_name.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (vendorFilter !== 'ALL' && r.vendor_id !== vendorFilter) return false;
      if (projectFilter !== 'ALL' && r.project_department !== projectFilter) return false;
      if (methodFilter !== 'ALL' && r.requested_payment_method !== methodFilter) return false;
      if (requesterFilter !== 'ALL' && r.requester_id !== requesterFilter) return false;

      return true;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [
    requests,
    searchQuery,
    statusFilter,
    vendorFilter,
    projectFilter,
    methodFilter,
    requesterFilter,
    sortField,
    sortAsc,
  ]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof PaymentRequest) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setVendorFilter('ALL');
    setProjectFilter('ALL');
    setMethodFilter('ALL');
    setRequesterFilter('ALL');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const dataToExport = filteredRequests.map((r) => ({
      'Request ID': r.id,
      'Vendor': r.vendor_name,
      'Amount (KES)': r.amount,
      'Invoice No': r.invoice_number,
      'Project': r.project_department,
      'Payment Method': r.requested_payment_method,
      'Requester': r.requester_name,
      'Status': r.status,
      'Threshold': r.approval_threshold,
      'Requested Date': r.requested_payment_date,
      'Created At': r.created_at,
    }));
    exportToCsv(`ImaraPay_Payment_Requests_${new Date().toISOString().split('T')[0]}.csv`, dataToExport);
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'ALL' ||
    vendorFilter !== 'ALL' ||
    projectFilter !== 'ALL' ||
    methodFilter !== 'ALL' ||
    requesterFilter !== 'ALL';

  if (isLoading) {
    return <LoadingState type="table-skeleton" rows={8} />;
  }

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete registry of all contractor requisitions, approval statuses, and payment records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download size={14} />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigateTo('payment-create')}
            leftIcon={<PlusCircle size={15} />}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, Vendor, Invoice, Project, Requester..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.filter((s) => s !== 'ALL').map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>

            {/* Vendor Dropdown */}
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 max-w-[150px] truncate"
            >
              <option value="ALL">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            {/* Filter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                showFilterDrawer || hasActiveFilters
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="More Filters"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span className="text-2xs">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters Row */}
        {showFilterDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Project / Department
              </label>
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white"
              >
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>
                    {p === 'ALL' ? 'All Projects' : p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Methods</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Requester
              </label>
              <select
                value={requesterFilter}
                onChange={(e) => {
                  setRequesterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Requesters</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-2xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>Request ID</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  onClick={() => handleSort('vendor_name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Vendor & Invoice</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    <span>Amount (KES)</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Project / Department</th>
                <th className="py-3.5 px-4">Requester</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  onClick={() => handleSort('requested_payment_date')}
                >
                  <div className="flex items-center gap-1">
                    <span>Requested Date</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8">
                    <EmptyState
                      icon="search"
                      title="No payment requests matched your filters"
                      description="Try adjusting your search criteria, clearing filter chips, or creating a new payment requisition."
                      actionText="Clear Filters"
                      onAction={clearAllFilters}
                    />
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigateTo('payment-detail', req.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-slate-950">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                        {req.vendor_name}
                      </div>
                      <div className="text-2xs text-slate-400 font-mono">
                        Inv: {req.invoice_number}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <CurrencyDisplay amount={req.amount} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate">
                      {req.project_department}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[130px]">
                        {req.requester_name}
                      </div>
                      <div className="text-2xs text-slate-400 truncate max-w-[130px]">
                        {req.requester_department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-2xs text-slate-500 whitespace-nowrap">
                      {formatDateOnly(req.requested_payment_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('payment-detail', req.id);
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-700 bg-slate-100 group-hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{paginatedRequests.length}</strong> of{' '}
            <strong className="text-slate-800">{filteredRequests.length}</strong> payment requests
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              leftIcon={<ChevronLeft size={14} />}
            >
              Prev
            </Button>
            <span className="text-xs font-semibold text-slate-700 px-1">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              rightIcon={<ChevronRight size={14} />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
