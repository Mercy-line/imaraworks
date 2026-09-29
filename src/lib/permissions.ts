import { UserAccount, PaymentRequest, UserRole } from '../types';

export function isEmployee(user?: UserAccount | null): boolean {
  return user?.role === 'EMPLOYEE';
}

export function isManager(user?: UserAccount | null): boolean {
  return user?.role === 'MANAGER';
}

export function isFinance(user?: UserAccount | null): boolean {
  return user?.role === 'FINANCE';
}

export function isAdmin(user?: UserAccount | null): boolean {
  return user?.role === 'ADMIN';
}

/**
 * Checks if user has permission to approve a given payment request
 * Enforces business rules:
 * 1. User cannot approve their own payment request
 * 2. If status is not PENDING_APPROVAL, cannot approve
 * 3. If <= KES 50k: Manager can approve (Step 1)
 * 4. If > KES 50k: Manager can approve Step 1; Finance can approve Step 2 once Step 1 is done
 */
export function canUserApproveRequest(
  user: UserAccount | null,
  request: PaymentRequest
): { allowed: boolean; reason?: string } {
  if (!user) return { allowed: false, reason: 'Authentication required' };
  if (user.status !== 'ACTIVE') return { allowed: false, reason: 'User account is inactive' };

  // Rule: Requester cannot approve their own request
  if (request.requester_id === user.id || request.requester_email.toLowerCase() === user.email.toLowerCase()) {
    return {
      allowed: false,
      reason: 'Segregation of duties: You cannot approve a payment request that you created.',
    };
  }

  if (request.status !== 'PENDING_APPROVAL') {
    return {
      allowed: false,
      reason: `Request is in ${request.status} state, not pending approval.`,
    };
  }

  // Single manager approval path (<= 50,000 KES)
  if (request.approval_threshold === 'SINGLE_MANAGER') {
    if (user.role === 'MANAGER' || user.role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Requires Manager role approval.',
    };
  }

  // Multi-tier approval path (> 50,000 KES)
  if (request.approval_threshold === 'MANAGER_AND_FINANCE') {
    if (request.current_approval_step === 'MANAGER_STEP') {
      if (user.role === 'MANAGER' || user.role === 'ADMIN') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Requires Step 1 Operations Manager approval before Finance review.',
      };
    }

    if (request.current_approval_step === 'FINANCE_STEP') {
      if (user.role === 'FINANCE' || user.role === 'ADMIN') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Requires Step 2 Finance Officer approval.',
      };
    }
  }

  return { allowed: false, reason: 'Approval criteria not satisfied.' };
}

/**
 * Checks if user can reject the request (must be Manager, Finance, or Admin)
 */
export function canUserRejectRequest(
  user: UserAccount | null,
  request: PaymentRequest
): { allowed: boolean; reason?: string } {
  if (!user) return { allowed: false, reason: 'Authentication required' };
  if (user.status !== 'ACTIVE') return { allowed: false, reason: 'User account is inactive' };

  if (request.requester_id === user.id) {
    return {
      allowed: false,
      reason: 'You cannot reject your own request; you can cancel or edit it if in draft.',
    };
  }

  if (request.status !== 'PENDING_APPROVAL') {
    return { allowed: false, reason: 'Only pending requests can be rejected.' };
  }

  if (user.role === 'MANAGER' || user.role === 'FINANCE' || user.role === 'ADMIN') {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient role permissions to reject.' };
}

/**
 * Checks if user can process the payment (Finance or Admin only, request must be APPROVED)
 */
export function canUserProcessPayment(
  user: UserAccount | null,
  request: PaymentRequest
): { allowed: boolean; reason?: string } {
  if (!user) return { allowed: false, reason: 'Authentication required' };
  if (user.status !== 'ACTIVE') return { allowed: false, reason: 'User account is inactive' };

  if (user.role !== 'FINANCE' && user.role !== 'ADMIN') {
    return {
      allowed: false,
      reason: 'Only Finance Officers and Administrators can initiate disbursements.',
    };
  }

  if (request.status !== 'APPROVED') {
    return {
      allowed: false,
      reason: `Payment requires full approval before processing. Current state: ${request.status}`,
    };
  }

  return { allowed: true };
}

/**
 * Checks if user can edit/delete a draft request
 */
export function canUserEditDraft(user: UserAccount | null, request: PaymentRequest): boolean {
  if (!user || user.status !== 'ACTIVE') return false;
  if (request.status !== 'DRAFT') return false;
  return request.requester_id === user.id || user.role === 'ADMIN';
}

/**
 * Checks if user can submit a draft request
 */
export function canUserSubmitDraft(user: UserAccount | null, request: PaymentRequest): boolean {
  if (!user || user.status !== 'ACTIVE') return false;
  if (request.status !== 'DRAFT') return false;
  return request.requester_id === user.id || user.role === 'ADMIN';
}
