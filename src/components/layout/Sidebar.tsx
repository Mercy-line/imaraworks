import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, ViewType } from '../../contexts/NavigationContext';
import {
  LayoutDashboard,
  Receipt,
  CheckSquare,
  CreditCard,
  Building2,
  BarChart3,
  ScrollText,
  Users,
  PlusCircle,
  HardHat,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { mockDb } from '../../api/mockDb';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentView, navigateTo, isSidebarCollapsed, toggleSidebar } = useNavigation();

  // Dynamic badge counts
  const [managerPendingCount, setManagerPendingCount] = useState(0);
  const [financePendingCount, setFinancePendingCount] = useState(0);
  const [readyProcessingCount, setReadyProcessingCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      const requests = mockDb.getPaymentRequests();
      const managerPending = requests.filter(
        (r) => r.status === 'PENDING_APPROVAL' && r.current_approval_step === 'MANAGER_STEP'
      ).length;
      const financePending = requests.filter(
        (r) => r.status === 'PENDING_APPROVAL' && r.current_approval_step === 'FINANCE_STEP'
      ).length;
      const readyToProcess = requests.filter((r) => r.status === 'APPROVED').length;

      setManagerPendingCount(managerPending);
      setFinancePendingCount(financePending);
      setReadyProcessingCount(readyToProcess);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  interface NavItem {
    id: ViewType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    roles?: string[];
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'payments',
      label: 'Payment Requests',
      icon: Receipt,
    },
    // Manager Approvals
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: currentUser?.role === 'FINANCE' ? financePendingCount : managerPendingCount,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      roles: ['MANAGER', 'FINANCE', 'ADMIN'],
    },
    // Finance Disbursement Processing
    {
      id: 'processing',
      label: 'Processing Queue',
      icon: CreditCard,
      badge: readyProcessingCount,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      roles: ['FINANCE', 'ADMIN'],
    },
    // Vendors
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Building2,
    },
    // Reports
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['MANAGER', 'FINANCE', 'ADMIN'],
    },
    // Admin only
    {
      id: 'audit',
      label: 'Audit Log',
      icon: ScrollText,
      roles: ['ADMIN'],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      roles: ['ADMIN'],
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return currentUser ? item.roles.includes(currentUser.role) : false;
  });

  return (
    <aside
      className={cn(
        'fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
            <HardHat size={22} className="text-slate-950" />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">ImaraPay</span>
                <span className="text-2xs font-semibold px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                  OPS
                </span>
              </div>
              <p className="text-2xs text-slate-400 truncate">ImaraWorks Ltd.</p>
            </div>
          )}
        </div>

        {/* Collapse button on desktop */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Quick New Request CTA */}
        <button
          type="button"
          onClick={() => navigateTo('payment-create')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-sm mb-4',
            isSidebarCollapsed ? 'justify-center' : ''
          )}
          title="Create New Payment Request"
        >
          <PlusCircle size={18} className="shrink-0 text-slate-950" />
          {!isSidebarCollapsed && <span className="text-xs tracking-tight">New Payment Request</span>}
        </button>

        {!isSidebarCollapsed && (
          <div className="px-3 pt-2 pb-1 text-2xs font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
        )}

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === 'payments' &&
              (currentView === 'payment-detail' ||
                currentView === 'payment-create' ||
                currentView === 'payment-edit'));

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
                isSidebarCollapsed ? 'justify-center' : 'justify-between'
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  size={18}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
                  )}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-2xs font-bold border shrink-0',
                    item.badgeColor || 'bg-slate-700 text-slate-200 border-slate-600'
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed badge pill */}
              {isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Role Context Footer Card */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        {!isSidebarCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-amber-400" />
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.name.split(' ')[0]} ({currentUser?.role})
              </div>
              <div className="text-2xs text-slate-400 truncate">
                Active Session
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400" title={currentUser?.name}>
              <Shield size={16} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
