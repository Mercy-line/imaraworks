import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { UserAccount, UserRole, UserStatus } from '../../../types';
import { usersApi } from '../../../api/usersApi';
import { formatDateOnly, formatDateTime } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { LoadingState } from '../../common/LoadingState';
import {
  Users,
  Shield,
  Briefcase,
  DollarSign,
  UserCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
  UserX,
} from 'lucide-react';

export const UserManagementTable: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useNotifications();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPLOYEE');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('ACTIVE');
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const list = await usersApi.getUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedStatus(user.status);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !currentUser) return;

    setIsSaving(true);
    try {
      if (selectedRole !== editingUser.role) {
        await usersApi.updateUserRole(editingUser.id, selectedRole, currentUser);
      }
      if (selectedStatus !== editingUser.status) {
        await usersApi.updateUserStatus(editingUser.id, selectedStatus, currentUser);
      }

      showToast('success', 'User Updated', `Updated permissions and status for ${editingUser.name}.`);
      setEditingUser(null);
      await loadUsers();
      if (editingUser.id === currentUser.id) {
        await refreshUser();
      }
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'EMPLOYEE':
        return { label: 'Employee', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: UserCheck };
      case 'MANAGER':
        return { label: 'Manager', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Briefcase };
      case 'FINANCE':
        return { label: 'Finance Officer', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: DollarSign };
      case 'ADMIN':
        return { label: 'Administrator', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: Shield };
    }
  };

  if (isLoading) {
    return <LoadingState type="table-skeleton" rows={6} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">User & Access Governance</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {users.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage employee access, configure approval hierarchy roles, and toggle account statuses
          </p>
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs flex items-start gap-2.5">
        <Shield size={16} className="text-purple-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Historical Integrity Preservation Policy: </span>
          <span>
            Deactivating a user account prevents future logins and approvals, but all historic audit logs and signature timestamps remain immutable and permanently preserved.
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-2xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((user) => {
                const badge = getRoleBadge(user.role);
                const Icon = badge.icon;
                const isSelf = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-2xs text-slate-400 font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-2xs">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        <Icon size={11} />
                        <span>{badge.label}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{user.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-2xs text-slate-500">
                      {formatDateOnly(user.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                      >
                        <Edit2 size={12} />
                        <span>Configure</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Configure ${editingUser?.name}`}
        subtitle={editingUser?.email}
        maxWidth="md"
      >
        {editingUser && (
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Assign System Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN'] as UserRole[]).map((r) => {
                  const b = getRoleBadge(r);
                  const Icon = b.icon;
                  const isSelected = selectedRole === r;

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-amber-400' : 'text-slate-400'} />
                      <div className="font-semibold text-xs">{b.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Account Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('ACTIVE')}
                  className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
                    selectedStatus === 'ACTIVE'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>ACTIVE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('INACTIVE')}
                  disabled={editingUser.id === currentUser?.id}
                  className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 ${
                    selectedStatus === 'INACTIVE'
                      ? 'border-rose-600 bg-rose-50 text-rose-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <UserX size={14} />
                  <span>INACTIVE</span>
                </button>
              </div>
              {editingUser.id === currentUser?.id && (
                <p className="text-2xs text-slate-400 mt-1">
                  You cannot deactivate your own active administrative session.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
