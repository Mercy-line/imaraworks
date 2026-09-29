import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { UserRole } from '../../types';
import { Users, ChevronDown, Check, Shield, Briefcase, DollarSign, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export const RoleDemoSwitcher: React.FC = () => {
  const { currentUser, demoUsers, switchPersona } = useAuth();
  const { showToast } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'EMPLOYEE':
        return { label: 'Employee', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: UserCheck };
      case 'MANAGER':
        return { label: 'Manager', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Briefcase };
      case 'FINANCE':
        return { label: 'Finance', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: DollarSign };
      case 'ADMIN':
        return { label: 'Admin', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: Shield };
    }
  };

  const handleSelect = async (userId: string, userName: string, role: string) => {
    setIsOpen(false);
    if (currentUser?.id === userId) return;

    await switchPersona(userId);
    showToast('info', `Switched Persona to ${userName}`, `Role: ${role}. UI adapted accordingly.`, 3000);
  };

  const currentBadge = currentUser ? getRoleBadge(currentUser.role) : null;
  const RoleIcon = currentBadge?.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
        title="Switch demo persona to test different role permissions"
      >
        <Users size={14} className="text-slate-500" />
        <span className="hidden sm:inline text-slate-500 font-normal">Role Demo:</span>
        <span className="font-semibold text-slate-900">{currentUser?.name.split(' ')[0]}</span>
        {currentBadge && RoleIcon && (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-semibold border',
              currentBadge.bg
            )}
          >
            <RoleIcon size={10} />
            <span>{currentBadge.label}</span>
          </span>
        )}
        <ChevronDown size={13} className="text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-modal border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Case Study Persona Switcher
              </p>
              <p className="text-2xs text-slate-500 mt-0.5">
                Switch user to inspect role-based approval thresholds and permissions.
              </p>
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto">
              {demoUsers.map((user) => {
                const badge = getRoleBadge(user.role);
                const isSelected = currentUser?.id === user.id;
                const Icon = badge.icon;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user.id, user.name, badge.label)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors',
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 truncate">
                        <div className={cn('text-xs font-semibold truncate', isSelected ? 'text-white' : 'text-slate-900')}>
                          {user.name}
                        </div>
                        <div className={cn('text-2xs truncate', isSelected ? 'text-slate-300' : 'text-slate-500')}>
                          {user.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-semibold border',
                          isSelected ? 'bg-slate-800 text-slate-200 border-slate-700' : badge.bg
                        )}
                      >
                        <Icon size={10} />
                        {badge.label}
                      </span>
                      {isSelected && <Check size={14} className="text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
