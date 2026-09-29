import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { NavigationProvider, useNavigation, ViewType } from './contexts/NavigationContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './components/features/auth/LoginPage';
import { DashboardView } from './components/features/dashboard/DashboardView';
import { PaymentRequestList } from './components/features/payments/PaymentRequestList';
import { PaymentRequestDetail } from './components/features/payments/PaymentRequestDetail';
import { PaymentRequestCreate } from './components/features/payments/PaymentRequestCreate';
import { PaymentRequestEdit } from './components/features/payments/PaymentRequestEdit';
import { ApprovalsList } from './components/features/approvals/ApprovalsList';
import { PaymentProcessingQueue } from './components/features/processing/PaymentProcessingQueue';
import { VendorList } from './components/features/vendors/VendorList';
import { ReportsOverview } from './components/features/reports/ReportsOverview';
import { AuditLogTable } from './components/features/audit/AuditLogTable';
import { UserManagementTable } from './components/features/users/UserManagementTable';
import { ErrorState } from './components/common/ErrorState';
import { LoadingState } from './components/common/LoadingState';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const { currentView, navigateTo } = useNavigation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingState type="spinner" text="Initializing ImaraPay..." className="text-white" />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // Role-based view authorization checks
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;

      case 'payments':
        return <PaymentRequestList />;

      case 'payment-detail':
        return <PaymentRequestDetail />;

      case 'payment-create':
        return <PaymentRequestCreate />;

      case 'payment-edit':
        return <PaymentRequestEdit />;

      case 'approvals':
        if (
          currentUser.role !== 'MANAGER' &&
          currentUser.role !== 'FINANCE' &&
          currentUser.role !== 'ADMIN'
        ) {
          return (
            <ErrorState
              status={403}
              title="Approvals Desk Restricted"
              message="Only Managers, Finance Officers, and Administrators have sign-off authorization authority."
              onRetry={() => navigateTo('dashboard')}
            />
          );
        }
        return <ApprovalsList />;

      case 'processing':
        if (currentUser.role !== 'FINANCE' && currentUser.role !== 'ADMIN') {
          return (
            <ErrorState
              status={403}
              title="Disbursement Queue Restricted"
              message="Only Finance Officers and Administrators can execute payment disbursements."
              onRetry={() => navigateTo('dashboard')}
            />
          );
        }
        return <PaymentProcessingQueue />;

      case 'vendors':
        return <VendorList />;

      case 'reports':
        if (
          currentUser.role !== 'MANAGER' &&
          currentUser.role !== 'FINANCE' &&
          currentUser.role !== 'ADMIN'
        ) {
          return (
            <ErrorState
              status={403}
              title="Financial Reports Restricted"
              message="Executive analytics and aggregate cash-flow reports are restricted to Management and Finance."
              onRetry={() => navigateTo('dashboard')}
            />
          );
        }
        return <ReportsOverview />;

      case 'audit':
        if (currentUser.role !== 'ADMIN') {
          return (
            <ErrorState
              status={403}
              title="Audit Log Restricted"
              message="System security and immutable audit trails are reserved for Administrators."
              onRetry={() => navigateTo('dashboard')}
            />
          );
        }
        return <AuditLogTable />;

      case 'users':
        if (currentUser.role !== 'ADMIN') {
          return (
            <ErrorState
              status={403}
              title="User Governance Restricted"
              message="User account provisioning and role assignments are restricted to Administrators."
              onRetry={() => navigateTo('dashboard')}
            />
          );
        }
        return <UserManagementTable />;

      default:
        return <DashboardView />;
    }
  };

  return <AppShell>{renderView()}</AppShell>;
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationProvider>
          <MainAppContent />
        </NavigationProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
