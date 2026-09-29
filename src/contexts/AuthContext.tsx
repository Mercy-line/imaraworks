import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { authApi } from '../api/authApi';
import { INITIAL_USERS } from '../api/mockDb';

interface AuthContextType {
  currentUser: UserAccount | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  demoUsers: UserAccount[];
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchPersona: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const user = await authApi.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to load user session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setCurrentUser(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchPersona = async (userId: string) => {
    setIsLoading(true);
    try {
      const user = await authApi.switchDemoUser(userId);
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const user = await authApi.getCurrentUser();
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isLoading,
        demoUsers: INITIAL_USERS,
        login,
        logout,
        switchPersona,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
