import { PaymentRequest, UserAccount } from '../types';
import { mockDb } from './mockDb';
import { simulateDelay } from '../lib/utils';
import { canUserApproveRequest, canUserRejectRequest } from '../lib/permissions';
import { AppApiError } from './client';

export const approvalsApi = {
  /**
   * Get requests awaiting approval for the current user's role
   */
  async getPendingApprovals(currentUser: UserAccount): Promise<PaymentRequest[]> {
    await simulateDelay(200);
    const allRequests = mockDb.getPaymentRequests();

    const pending = allRequests.filter((r) => r.status === 'PENDING_APPROVAL');

    if (currentUser.role === 'ADMIN') {
      return pending;
    }

    if (currentUser.role === 'MANAGER') {
      // Manager reviews Step 1 (for both <= 50k and > 50k)
      return pending.filter(
        (r) => r.current_approval_step === 'MANAGER_STEP' && r.requester_id !== currentUser.id
      );
    }

    if (currentUser.role === 'FINANCE') {
      // Finance reviews Step 2 (for > 50k requests that passed Manager step)
      return pending.filter((r) => r.current_approval_step === 'FINANCE_STEP');
    }

    return [];
  },

  /**
   * Approve a payment request
   */
  async approvePaymentRequest(
    requestId: string,
    currentUser: UserAccount,
    comments?: string
  ): Promise<PaymentRequest> {
    await simulateDelay(350);
    const req = mockDb.getPaymentRequestById(requestId);
    if (!req) throw new AppApiError(404, `Payment request ${requestId} not found.`);

    const check = canUserApproveRequest(currentUser, req);
    if (!check.allowed) {
      throw new AppApiError(403, check.reason || 'You do not have permission to approve this request.');
    }

    const now = new Date().toISOString();
    const approvals = mockDb.getApprovals(requestId);

    if (req.approval_threshold === 'SINGLE_MANAGER') {
      // Single Manager Step
      const step1 = approvals.find((a) => a.step_number === 1);
      if (step1) {
        step1.decision = 'APPROVED';
        step1.approver_id = currentUser.id;
        step1.approver_name = currentUser.name;
        step1.decision_timestamp = now;
        step1.comments = comments || 'Approved by Operations Manager';
        mockDb.updateApproval(step1);
      }

      req.status = 'APPROVED';
      req.current_approval_step = 'COMPLETED';
      req.approved_at = now;
      req.updated_at = now;
      mockDb.updatePaymentRequest(req);

      mockDb.recordAuditEvent({
        actor_id: currentUser.id,
        actor_name: currentUser.name,
        actor_role: currentUser.role,
        action: 'Approved Payment Request',
        entity_type: 'Approval',
        entity_id: requestId,
        request_code: requestId,
        description: `${currentUser.name} (${currentUser.role}) approved ${requestId} [KES ${req.amount.toLocaleString()}]. Request is now APPROVED for payment processing.`,
        metadata: { comments },
      });
    } else {
      // Multi-tier (> 50k)
      if (req.current_approval_step === 'MANAGER_STEP') {
        const step1 = approvals.find((a) => a.step_number === 1);
        if (step1) {
          step1.decision = 'APPROVED';
          step1.approver_id = currentUser.id;
          step1.approver_name = currentUser.name;
          step1.decision_timestamp = now;
          step1.comments = comments || 'Approved by Operations Manager';
          mockDb.updateApproval(step1);
        }

        // Advance to Finance Step
        req.current_approval_step = 'FINANCE_STEP';
        req.updated_at = now;
        mockDb.updatePaymentRequest(req);

        mockDb.recordAuditEvent({
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: currentUser.role,
          action: 'Approved Manager Tier (Step 1/2)',
          entity_type: 'Approval',
          entity_id: requestId,
          request_code: requestId,
          description: `${currentUser.name} approved Tier 1. Request routed to Finance for secondary approval.`,
          metadata: { comments },
        });
      } else if (req.current_approval_step === 'FINANCE_STEP') {
        const step2 = approvals.find((a) => a.step_number === 2);
        if (step2) {
          step2.decision = 'APPROVED';
          step2.approver_id = currentUser.id;
          step2.approver_name = currentUser.name;
          step2.decision_timestamp = now;
          step2.comments = comments || 'Approved by Finance Officer';
          mockDb.updateApproval(step2);
        }

        req.status = 'APPROVED';
        req.current_approval_step = 'COMPLETED';
        req.approved_at = now;
        req.updated_at = now;
        mockDb.updatePaymentRequest(req);

        mockDb.recordAuditEvent({
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: currentUser.role,
          action: 'Approved Finance Tier (Step 2/2)',
          entity_type: 'Approval',
          entity_id: requestId,
          request_code: requestId,
          description: `${currentUser.name} (${currentUser.role}) completed secondary approval. Request is now APPROVED for disbursement.`,
          metadata: { comments },
        });
      }
    }

    return req;
  },

  /**
   * Reject a payment request with mandatory reason
   */
  async rejectPaymentRequest(
    requestId: string,
    currentUser: UserAccount,
    reason: string
  ): Promise<PaymentRequest> {
    await simulateDelay(350);

    const cleanReason = reason.trim();
    if (!cleanReason || cleanReason.length < 5) {
      throw new AppApiError(400, 'A clear rejection reason (at least 5 characters) is mandatory.');
    }

    const req = mockDb.getPaymentRequestById(requestId);
    if (!req) throw new AppApiError(404, `Payment request ${requestId} not found.`);

    const check = canUserRejectRequest(currentUser, req);
    if (!check.allowed) {
      throw new AppApiError(403, check.reason || 'You do not have permission to reject this request.');
    }

    const now = new Date().toISOString();
    const approvals = mockDb.getApprovals(requestId);

    // Update active step
    const activeStepNumber = req.current_approval_step === 'FINANCE_STEP' ? 2 : 1;
    const activeApproval = approvals.find((a) => a.step_number === activeStepNumber);
    if (activeApproval) {
      activeApproval.decision = 'REJECTED';
      activeApproval.approver_id = currentUser.id;
      activeApproval.approver_name = currentUser.name;
      activeApproval.rejection_reason = cleanReason;
      activeApproval.decision_timestamp = now;
      mockDb.updateApproval(activeApproval);
    }

    req.status = 'REJECTED';
    req.rejection_reason = cleanReason;
    req.rejection_by = currentUser.name;
    req.rejection_by_role = currentUser.role;
    req.rejection_at = now;
    req.updated_at = now;

    mockDb.updatePaymentRequest(req);

    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Rejected Payment Request',
      entity_type: 'Approval',
      entity_id: requestId,
      request_code: requestId,
      description: `${currentUser.name} (${currentUser.role}) rejected ${requestId}. Reason: "${cleanReason}"`,
    });

    return req;
  },
};
