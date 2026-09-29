import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';
import { useNavigation } from '../../contexts/NavigationContext';
import { cn } from '../../lib/utils';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSidebarCollapsed, toggleSidebar } = useNavigation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden',
          isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={toggleSidebar}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Floating Toast Container */}
      <ToastContainer />
    </div>
  );
};
