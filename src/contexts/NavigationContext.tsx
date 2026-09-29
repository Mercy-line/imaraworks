import React, { createContext, useContext, useState } from 'react';

export type ViewType =
  | 'dashboard'
  | 'payments'
  | 'payment-detail'
  | 'payment-create'
  | 'payment-edit'
  | 'approvals'
  | 'processing'
  | 'vendors'
  | 'reports'
  | 'audit'
  | 'users';

interface NavigationContextType {
  currentView: ViewType;
  selectedRequestId: string | null;
  searchQuery: string;
  isSidebarCollapsed: boolean;
  navigateTo: (view: ViewType, requestId?: string) => void;
  setSearchQuery: (q: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const navigateTo = (view: ViewType, requestId?: string) => {
    setCurrentView(view);
    if (requestId) {
      setSelectedRequestId(requestId);
    }
    // Scroll to top upon navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        selectedRequestId,
        searchQuery,
        isSidebarCollapsed,
        navigateTo,
        setSearchQuery,
        toggleSidebar,
        setSidebarCollapsed: setIsSidebarCollapsed,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
