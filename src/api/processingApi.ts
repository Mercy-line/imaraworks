import { PaymentRequest, PaymentAttempt, UserAccount } from '../types';
import { mockDb } from './mockDb';
import { simulateDelay, generateIdempotencyKey } from '../lib/utils';
import { canUserProcessPayment } from '../lib/permissions';
import { AppApiError } from './client';

export type MockOutcomeType = 'SUCCESS' | 'FAILED' | 'TIMEOUT_AMBIGUOUS';

export const processingApi = {
  /**
   * Get all approved requests ready for finance disbursement
   */
  async getProcessingQueue(): Promise<PaymentRequest[]> {
    await simulateDelay(200);
    return mockDb.getPaymentRequests().filter((r) => r.status === 'APPROVED');
  },

  /**
   * Get payment attempts for a request
   */
  async getPaymentAttempts(requestId: string): Promise<PaymentAttempt[]> {
    await simulateDelay(150);
    return mockDb.getAttempts(requestId);
  },

  /**
   * Execute payment disbursement through the Mock Provider engine
   */
  async processPayment(
    requestId: string,
    currentUser: UserAccount,
    outcomeChoice: MockOutcomeType = 'SUCCESS'
  ): Promise<{ request: PaymentRequest; attempt: PaymentAttempt }> {
    // Longer simulated delay for realistic provider transaction roundtrip
    await simulateDelay(700);

    const req = mockDb.getPaymentRequestById(requestId);
    if (!req) throw new AppApiError(404, `Payment request ${requestId} not found.`);

    const check = canUserProcessPayment(currentUser, req);
    if (!check.allowed) {
      throw new AppApiError(403, check.reason || 'You cannot process this payment.');
    }

    const idempotencyKey = generateIdempotencyKey(req.id);
    const now = new Date().toISOString();
    const providerType = req.requested_payment_method === 'M-Pesa' ? 'MOCK_MPESA' : 'MOCK_BANK';

    // Step 1: Record that processing started
    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Payment Processing Initiated',
      entity_type: 'PaymentAttempt',
      entity_id: requestId,
      request_code: requestId,
      description: `${currentUser.name} initiated ${req.requested_payment_method} disbursement for KES ${req.amount.toLocaleString()} (Idempotency Key: ${idempotencyKey})`,
    });

    if (outcomeChoice === 'SUCCESS') {
      const randomRef =
        req.requested_payment_method === 'M-Pesa'
          ? `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          : `BNK-TRF-${Math.floor(10000 + Math.random() * 90000)}`;

      const attempt: PaymentAttempt = {
        id: `att-${Date.now().toString().slice(-6)}`,
        payment_request_id: requestId,
        initiated_by_id: currentUser.id,
        initiated_by_name: currentUser.name,
        idempotency_key: idempotencyKey,
        provider: providerType,
        amount: req.amount,
        currency: 'KES',
        status: 'SUCCESS',
        provider_reference: randomRef,
        reconciliation_status: 'NOT_REQUIRED',
        initiated_at: now,
        completed_at: new Date().toISOString(),
        retry_count: 0,
      };

      mockDb.addAttempt(attempt);

      // Update request
      req.status = 'PAID';
      req.paid_at = attempt.completed_at;
      req.updated_at = attempt.completed_at || now;
      mockDb.updatePaymentRequest(req);

      // Update vendor total paid
      const vendor = mockDb.getVendorById(req.vendor_id);
      if (vendor) {
        vendor.total_paid += req.amount;
        mockDb.updateVendor(vendor);
      }

      mockDb.recordAuditEvent({
        actor_id: 'sys-provider',
        actor_name: 'Mock Payment Provider',
        actor_role: 'SYSTEM',
        action: 'Payment Completed',
        entity_type: 'PaymentAttempt',
        entity_id: attempt.id,
        request_code: requestId,
        description: `Disbursement completed successfully. Provider Reference: ${randomRef}. Vendor account credited.`,
        metadata: { provider_reference: randomRef, amount: req.amount },
      });

      return { request: req, attempt };
    }

    if (outcomeChoice === 'FAILED') {
      const failureReason =
        req.requested_payment_method === 'M-Pesa'
          ? 'Mock M-Pesa Provider: Insufficient corporate paybill float or phone number format unverified.'
          : 'Mock Bank Gateway: Beneficiary account number rejected by recipient clearing house.';

      const attempt: PaymentAttempt = {
        id: `att-${Date.now().toString().slice(-6)}`,
        payment_request_id: requestId,
        initiated_by_id: currentUser.id,
        initiated_by_name: currentUser.name,
        idempotency_key: idempotencyKey,
        provider: providerType,
        amount: req.amount,
        currency: 'KES',
        status: 'FAILED',
        failure_reason: failureReason,
        reconciliation_status: 'NOT_REQUIRED',
        initiated_at: now,
        completed_at: new Date().toISOString(),
        retry_count: 0,
      };

      mockDb.addAttempt(attempt);

      req.status = 'FAILED';
      req.updated_at = attempt.completed_at || now;
      mockDb.updatePaymentRequest(req);

      mockDb.recordAuditEvent({
        actor_id: 'sys-provider',
        actor_name: 'Mock Payment Provider',
        actor_role: 'SYSTEM',
        action: 'Payment Failed',
        entity_type: 'PaymentAttempt',
        entity_id: attempt.id,
        request_code: requestId,
        description: `Payment transaction failed. Reason: "${failureReason}".`,
      });

      return { request: req, attempt };
    }

    // TIMEOUT_AMBIGUOUS outcome
    const timeoutReason =
      'Provider gateway timeout (HTTP 504 Gateway Timeout). Transaction status unconfirmed by provider core.';

    const attempt: PaymentAttempt = {
      id: `att-${Date.now().toString().slice(-6)}`,
      payment_request_id: requestId,
      initiated_by_id: currentUser.id,
      initiated_by_name: currentUser.name,
      idempotency_key: idempotencyKey,
      provider: providerType,
      amount: req.amount,
      currency: 'KES',
      status: 'TIMEOUT_AMBIGUOUS',
      failure_reason: timeoutReason,
      reconciliation_status: 'PENDING_VERIFICATION',
      reconciliation_notes:
        'Ambiguous outcome. Do NOT re-initiate payment immediately to prevent duplicate charge. Perform reconciliation check.',
      initiated_at: now,
      completed_at: new Date().toISOString(),
      retry_count: 0,
    };

    mockDb.addAttempt(attempt);

    req.status = 'FAILED';
    req.updated_at = attempt.completed_at || now;
    mockDb.updatePaymentRequest(req);

    mockDb.recordAuditEvent({
      actor_id: 'sys-provider',
      actor_name: 'Mock Payment Provider',
      actor_role: 'SYSTEM',
      action: 'Payment Provider Timed Out (Ambiguous)',
      entity_type: 'PaymentAttempt',
      entity_id: attempt.id,
      request_code: requestId,
      description: `Provider timeout encountered for ${requestId}. Safe retry guard active. Requires status reconciliation.`,
    });

    return { request: req, attempt };
  },

  /**
   * Safe reconciliation for ambiguous/failed payments
   */
  async reconcilePayment(
    requestId: string,
    currentUser: UserAccount,
    resolution: 'CONFIRM_PAID' | 'RESET_FOR_RETRY'
  ): Promise<{ request: PaymentRequest; attempt?: PaymentAttempt }> {
    await simulateDelay(400);

    const req = mockDb.getPaymentRequestById(requestId);
    if (!req) throw new AppApiError(404, `Payment request ${requestId} not found.`);

    if (currentUser.role !== 'FINANCE' && currentUser.role !== 'ADMIN') {
      throw new AppApiError(403, 'Only Finance Officers and Administrators can reconcile payment transactions.');
    }

    const attempts = mockDb.getAttempts(requestId);
    const lastAttempt = attempts[0];

    if (resolution === 'CONFIRM_PAID') {
      const verifiedRef = `REC-PAY-${Math.floor(10000 + Math.random() * 90000)}`;
      if (lastAttempt) {
        lastAttempt.status = 'SUCCESS';
        lastAttempt.provider_reference = verifiedRef;
        lastAttempt.reconciliation_status = 'RESOLVED_SUCCESS';
        lastAttempt.reconciliation_notes = `Reconciliation confirmed debit on bank statement by ${currentUser.name}.`;
        mockDb.updateAttempt(lastAttempt);
      }

      req.status = 'PAID';
      req.paid_at = new Date().toISOString();
      req.updated_at = new Date().toISOString();
      mockDb.updatePaymentRequest(req);

      const vendor = mockDb.getVendorById(req.vendor_id);
      if (vendor) {
        vendor.total_paid += req.amount;
        mockDb.updateVendor(vendor);
      }

      mockDb.recordAuditEvent({
        actor_id: currentUser.id,
        actor_name: currentUser.name,
        actor_role: currentUser.role,
        action: 'Reconciliation: Confirmed Paid',
        entity_type: 'PaymentAttempt',
        entity_id: requestId,
        request_code: requestId,
        description: `${currentUser.name} verified provider bank log and confirmed disbursement for ${requestId}. Ref: ${verifiedRef}`,
      });
    } else {
      // RESET_FOR_RETRY: Bank confirmed no money was moved; safe to reset status back to APPROVED
      if (lastAttempt) {
        lastAttempt.reconciliation_status = 'RESOLVED_FAILED';
        lastAttempt.reconciliation_notes = `Provider logs confirmed transaction never executed. Reset for safe retry by ${currentUser.name}.`;
        mockDb.updateAttempt(lastAttempt);
      }

      req.status = 'APPROVED';
      req.updated_at = new Date().toISOString();
      mockDb.updatePaymentRequest(req);

      mockDb.recordAuditEvent({
        actor_id: currentUser.id,
        actor_name: currentUser.name,
        actor_role: currentUser.role,
        action: 'Reconciliation: Safe Reset for Retry',
        entity_type: 'PaymentRequest',
        entity_id: requestId,
        request_code: requestId,
        description: `${currentUser.name} verified transaction was not debited. Request safely reset to APPROVED for re-processing.`,
      });
    }

    return { request: req, attempt: lastAttempt };
  },
};
