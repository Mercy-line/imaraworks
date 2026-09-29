import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { RoleDemoSwitcher } from './RoleDemoSwitcher';
import { NotificationMenu } from './NotificationDrawer';
import {
  Menu,
  Search,
  LogOut,
  User,
  Shield,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentView, selectedRequestId, searchQuery, setSearchQuery, navigateTo, toggleSidebar } =
    useNavigation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'payments':
        return 'Payment Requests';
      case 'payment-detail':
        return selectedRequestId ? `Payment Request ${selectedRequestId}` : 'Payment Request Details';
      case 'payment-create':
        return 'New Payment Request';
      case 'payment-edit':
        return selectedRequestId ? `Edit Request ${selectedRequestId}` : 'Edit Payment Request';
      case 'approvals':
        return currentUser?.role === 'FINANCE' ? 'Finance Approvals' : 'Manager Approvals Queue';
      case 'processing':
        return 'Disbursement & Payment Processing';
      case 'vendors':
        return 'Vendor Master Directory';
      case 'reports':
        return 'Financial Reports & Analytics';
      case 'audit':
        return 'System Audit Trail';
      case 'users':
        return 'User & Access Governance';
      default:
        return 'ImaraPay';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('payments');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hamburger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-2xs text-slate-500 truncate">
              <span
                onClick={() => navigateTo('dashboard')}
                className="hover:text-slate-800 cursor-pointer font-medium"
              >
                ImaraWorks
              </span>
              <ChevronRight size={10} className="text-slate-400 shrink-0" />
              <span className="text-slate-700 font-medium truncate">{getViewTitle()}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate leading-tight mt-0.5">
              {getViewTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Global Quick Search (hidden on small mobile) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor, invoice, PR#..."
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
            />
          </form>
        </div>

        {/* Right: Quick Action + Role Demo Switcher + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Prominent Quick Request CTA for Employees & Managers */}
          {currentView !== 'payment-create' && (
            <button
              type="button"
              onClick={() => navigateTo('payment-create')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <PlusCircle size={14} />
              <span>+ New Request</span>
            </button>
          )}

          {/* Interactive Role Demo Switcher */}
          <RoleDemoSwitcher />

          {/* Notifications Popover */}
          <NotificationMenu />

          {/* User Profile Avatar / Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
              aria-label="User profile menu"
            >
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">{currentUser?.role.toLowerCase()}</div>
              </div>
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-modal border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-2xs text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-semibold">
                      <Shield size={10} />
                      <span>{currentUser?.role}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigateTo('dashboard');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left transition-colors"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>My Workspace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left transition-colors font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
