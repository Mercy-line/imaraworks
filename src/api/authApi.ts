import { UserAccount, ApiResponse } from '../types';
import { mockDb, INITIAL_USERS } from './mockDb';
import { simulateDelay } from '../lib/utils';
import { AppApiError } from './client';

const CURRENT_USER_KEY = 'imarapay_current_user';

export const authApi = {
  /**
   * Authenticate user with email and password
   */
  async login(email: string, _password?: string): Promise<ApiResponse<UserAccount>> {
    await simulateDelay(350);

    const cleanEmail = email.trim().toLowerCase();
    const user = mockDb.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new AppApiError(401, 'Invalid email or password. Please check your credentials.');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppApiError(403, 'Your account has been deactivated. Please contact an administrator.');
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    mockDb.recordAuditEvent({
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: 'User Logged In',
      entity_type: 'UserAccount',
      entity_id: user.id,
      description: `${user.name} (${user.role}) logged in successfully.`,
    });

    return {
      data: user,
      success: true,
      message: 'Login successful',
    };
  },

  /**
   * Get currently active session user
   */
  async getCurrentUser(): Promise<UserAccount | null> {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Sync with db to ensure active status / updated role
        const fresh = mockDb.getUserById(parsed.id);
        return fresh || parsed;
      } catch {
        return null;
      }
    }
    // Default to Alice Mwangi (Employee) for initial view if none selected
    const defaultUser = INITIAL_USERS[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  /**
   * Quick demo user switcher (Alice, Brian, Carol, David, Faith, Grace)
   */
  async switchDemoUser(userId: string): Promise<UserAccount> {
    await simulateDelay(150);
    const user = mockDb.getUserById(userId);
    if (!user) throw new AppApiError(404, 'User not found');

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    mockDb.recordAuditEvent({
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: 'Switched Active Demo Persona',
      entity_type: 'UserAccount',
      entity_id: user.id,
      description: `Persona switched to ${user.name} [${user.role}].`,
    });

    return user;
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    await simulateDelay(150);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  /**
   * Forgot password reset trigger
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{ sent: boolean }>> {
    await simulateDelay(400);
    const cleanEmail = email.trim().toLowerCase();
    const user = mockDb.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // For security, don't reveal non-existent emails, just return success notice
      return {
        data: { sent: true },
        success: true,
        message: 'If this email is registered in ImaraPay, a password reset link has been dispatched.',
      };
    }

    mockDb.recordAuditEvent({
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: 'Password Reset Requested',
      entity_type: 'UserAccount',
      entity_id: user.id,
      description: `Password reset link requested for ${user.email}`,
    });

    return {
      data: { sent: true },
      success: true,
      message: `Password reset instructions have been sent to ${email}.`,
    };
  },
};
