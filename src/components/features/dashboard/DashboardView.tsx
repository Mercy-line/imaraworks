import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { EmployeeDashboard } from './EmployeeDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { FinanceDashboard } from './FinanceDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardView: React.FC = () => {
  const { currentUser } = useAuth();

  switch (currentUser?.role) {
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'FINANCE':
      return <FinanceDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'EMPLOYEE':
    default:
      return <EmployeeDashboard />;
  }
};
