import { UserAccount, UserRole, UserStatus } from '../types';
import { mockDb } from './mockDb';
import { simulateDelay } from '../lib/utils';
import { AppApiError } from './client';

export const usersApi = {
  async getUsers(): Promise<UserAccount[]> {
    await simulateDelay(150);
    return mockDb.getUsers();
  },

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    currentUser: UserAccount
  ): Promise<UserAccount> {
    await simulateDelay(250);
    if (currentUser.role !== 'ADMIN') {
      throw new AppApiError(403, 'Only Administrators can modify user account status.');
    }

    const user = mockDb.getUserById(userId);
    if (!user) throw new AppApiError(404, 'User not found');

    if (user.id === currentUser.id && status === 'INACTIVE') {
      throw new AppApiError(400, 'You cannot deactivate your own administrative account.');
    }

    user.status = status;
    mockDb.updateUser(user);

    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: status === 'ACTIVE' ? 'Activated User Account' : 'Deactivated User Account',
      entity_type: 'UserAccount',
      entity_id: user.id,
      description: `${currentUser.name} set account status of ${user.name} (${user.email}) to ${status}. Historic approvals remain intact.`,
    });

    return user;
  },

  async updateUserRole(
    userId: string,
    role: UserRole,
    currentUser: UserAccount
  ): Promise<UserAccount> {
    await simulateDelay(250);
    if (currentUser.role !== 'ADMIN') {
      throw new AppApiError(403, 'Only Administrators can assign user roles.');
    }

    const user = mockDb.getUserById(userId);
    if (!user) throw new AppApiError(404, 'User not found');

    const previousRole = user.role;
    user.role = role;
    mockDb.updateUser(user);

    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Updated User Role',
      entity_type: 'UserAccount',
      entity_id: user.id,
      description: `${currentUser.name} changed role for ${user.name} from ${previousRole} to ${role}.`,
    });

    return user;
  },
};
