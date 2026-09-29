import {
  PaymentRequest,
  PaymentRequestFilters,
  ApprovalThreshold,
  Approval,
  PaymentAttempt,
  AuditEvent,
  UserAccount,
} from '../types';
import { mockDb } from './mockDb';
import { simulateDelay, generateRequestId } from '../lib/utils';
import { AppApiError } from './client';

export interface PaymentRequestDetailsResponse {
  request: PaymentRequest;
  approvals: Approval[];
  attempts: PaymentAttempt[];
  auditHistory: AuditEvent[];
}

export const paymentsApi = {
  /**
   * Get filtered payment requests
   */
  async getPaymentRequests(filters?: PaymentRequestFilters): Promise<PaymentRequest[]> {
    await simulateDelay(200);
    let requests = mockDb.getPaymentRequests();

    if (!filters) return requests;

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      requests = requests.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.vendor_name.toLowerCase().includes(q) ||
          r.invoice_number.toLowerCase().includes(q) ||
          r.project_department.toLowerCase().includes(q) ||
          r.requester_name.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      requests = requests.filter((r) => r.status === filters.status);
    }

    if (filters.vendor_id && filters.vendor_id !== 'ALL') {
      requests = requests.filter((r) => r.vendor_id === filters.vendor_id);
    }

    if (filters.requester_id && filters.requester_id !== 'ALL') {
      requests = requests.filter((r) => r.requester_id === filters.requester_id);
    }

    if (filters.project && filters.project !== 'ALL') {
      requests = requests.filter((r) => r.project_department === filters.project);
    }

    if (filters.payment_method && filters.payment_method !== 'ALL') {
      requests = requests.filter((r) => r.requested_payment_method === filters.payment_method);
    }

    if (filters.min_amount !== undefined && !isNaN(filters.min_amount)) {
      requests = requests.filter((r) => r.amount >= (filters.min_amount as number));
    }

    if (filters.max_amount !== undefined && !isNaN(filters.max_amount)) {
      requests = requests.filter((r) => r.amount <= (filters.max_amount as number));
    }

    if (filters.date_from) {
      requests = requests.filter((r) => r.created_at >= (filters.date_from as string));
    }

    if (filters.date_to) {
      requests = requests.filter((r) => r.created_at <= (filters.date_to as string));
    }

    return requests;
  },

  /**
   * Get single request with complete nested details
   */
  async getPaymentRequest(id: string): Promise<PaymentRequestDetailsResponse> {
    await simulateDelay(200);
    const request = mockDb.getPaymentRequestById(id);
    if (!request) {
      throw new AppApiError(404, `Payment request ${id} not found.`);
    }

    const approvals = mockDb.getApprovals(id);
    const attempts = mockDb.getAttempts(id);
    const auditHistory = mockDb.getAuditEvents(id);

    return {
      request,
      approvals,
      attempts,
      auditHistory,
    };
  },

  /**
   * Duplicate invoice check helper
   */
  async checkDuplicateInvoice(
    vendorId: string,
    invoiceNumber: string,
    excludeRequestId?: string
  ): Promise<{ isDuplicate: boolean; existingRequest?: PaymentRequest }> {
    await simulateDelay(100);
    const existing = mockDb.findDuplicateInvoice(vendorId, invoiceNumber, excludeRequestId);
    return {
      isDuplicate: !!existing,
      existingRequest: existing,
    };
  },

  /**
   * Create a new payment request (as Draft or Submitted directly)
   */
  async createPaymentRequest(
    data: {
      vendor_id: string;
      amount: number;
      invoice_number: string;
      reason: string;
      project_department: string;
      requested_payment_method: 'M-Pesa' | 'Bank Transfer';
      requested_payment_date: string;
      supporting_notes?: string;
      attachment_name?: string;
      attachment_size?: string;
      submit_now?: boolean;
    },
    currentUser: UserAccount
  ): Promise<PaymentRequest> {
    await simulateDelay(350);

    const vendor = mockDb.getVendorById(data.vendor_id);
    if (!vendor) {
      throw new AppApiError(400, 'Selected vendor does not exist.');
    }

    if (data.amount <= 0) {
      throw new AppApiError(400, 'Payment amount must be greater than zero.');
    }

    const threshold: ApprovalThreshold = data.amount > 50000 ? 'MANAGER_AND_FINANCE' : 'SINGLE_MANAGER';
    const isSubmitting = !!data.submit_now;
    const now = new Date().toISOString();

    const existingCount = mockDb.getPaymentRequests().length;
    const id = generateRequestId(existingCount);

    const newRequest: PaymentRequest = {
      id,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      amount: Number(data.amount),
      currency: 'KES',
      invoice_number: data.invoice_number.trim(),
      reason: data.reason.trim(),
      project_department: data.project_department,
      requested_payment_method: data.requested_payment_method,
      requested_payment_date: data.requested_payment_date,
      supporting_notes: data.supporting_notes?.trim() || '',
      attachment_name: data.attachment_name || (data.supporting_notes ? 'Invoice_Document.pdf' : undefined),
      attachment_size: data.attachment_size || '1.8 MB',
      requester_id: currentUser.id,
      requester_name: currentUser.name,
      requester_email: currentUser.email,
      requester_department: currentUser.department,
      status: isSubmitting ? 'PENDING_APPROVAL' : 'DRAFT',
      approval_threshold: threshold,
      current_approval_step: isSubmitting ? 'MANAGER_STEP' : 'NONE',
      created_at: now,
      updated_at: now,
      submitted_at: isSubmitting ? now : undefined,
    };

    mockDb.createPaymentRequest(newRequest);

    // Record creation audit event
    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Created Payment Request',
      entity_type: 'PaymentRequest',
      entity_id: id,
      request_code: id,
      description: `${currentUser.name} created payment request ${id} for ${vendor.name} (KES ${newRequest.amount.toLocaleString()})`,
    });

    if (isSubmitting) {
      // Create initial approval records
      const step1: Approval = {
        id: `app-${id.replace('PR-', '')}-1`,
        payment_request_id: id,
        approver_role: 'MANAGER',
        step_number: 1,
        decision: 'PENDING',
      };
      mockDb.addApproval(step1);

      if (threshold === 'MANAGER_AND_FINANCE') {
        const step2: Approval = {
          id: `app-${id.replace('PR-', '')}-2`,
          payment_request_id: id,
          approver_role: 'FINANCE',
          step_number: 2,
          decision: 'PENDING',
        };
        mockDb.addApproval(step2);
      }

      mockDb.recordAuditEvent({
        actor_id: currentUser.id,
        actor_name: currentUser.name,
        actor_role: currentUser.role,
        action: 'Submitted Payment Request',
        entity_type: 'PaymentRequest',
        entity_id: id,
        request_code: id,
        description: `Submitted for approval (Threshold: ${
          threshold === 'SINGLE_MANAGER' ? '<= KES 50k (Single Manager)' : '> KES 50k (Manager + Finance)'
        })`,
      });
    }

    return newRequest;
  },

  /**
   * Submit an existing DRAFT request
   */
  async submitPaymentRequest(id: string, currentUser: UserAccount): Promise<PaymentRequest> {
    await simulateDelay(300);
    const req = mockDb.getPaymentRequestById(id);
    if (!req) throw new AppApiError(404, `Payment request ${id} not found.`);

    if (req.status !== 'DRAFT') {
      throw new AppApiError(400, `Cannot submit a request that is in ${req.status} status.`);
    }

    const now = new Date().toISOString();
    req.status = 'PENDING_APPROVAL';
    req.current_approval_step = 'MANAGER_STEP';
    req.submitted_at = now;
    req.updated_at = now;

    mockDb.updatePaymentRequest(req);

    // Add required approval chain
    const step1: Approval = {
      id: `app-${id.replace('PR-', '')}-1`,
      payment_request_id: id,
      approver_role: 'MANAGER',
      step_number: 1,
      decision: 'PENDING',
    };
    mockDb.addApproval(step1);

    if (req.approval_threshold === 'MANAGER_AND_FINANCE') {
      const step2: Approval = {
        id: `app-${id.replace('PR-', '')}-2`,
        payment_request_id: id,
        approver_role: 'FINANCE',
        step_number: 2,
        decision: 'PENDING',
      };
      mockDb.addApproval(step2);
    }

    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Submitted Payment Request',
      entity_type: 'PaymentRequest',
      entity_id: id,
      request_code: id,
      description: `${currentUser.name} submitted request ${id} for approval.`,
    });

    return req;
  },

  /**
   * Update draft payment request
   */
  async updatePaymentRequest(
    id: string,
    data: Partial<PaymentRequest>,
    currentUser: UserAccount
  ): Promise<PaymentRequest> {
    await simulateDelay(300);
    const req = mockDb.getPaymentRequestById(id);
    if (!req) throw new AppApiError(404, `Payment request ${id} not found.`);

    if (req.status !== 'DRAFT') {
      throw new AppApiError(400, 'Only draft payment requests can be edited directly.');
    }

    // Recalculate threshold if amount changed
    let updatedThreshold = req.approval_threshold;
    if (data.amount && data.amount !== req.amount) {
      updatedThreshold = data.amount > 50000 ? 'MANAGER_AND_FINANCE' : 'SINGLE_MANAGER';
    }

    let vendorName = req.vendor_name;
    if (data.vendor_id && data.vendor_id !== req.vendor_id) {
      const v = mockDb.getVendorById(data.vendor_id);
      if (v) vendorName = v.name;
    }

    const updated: PaymentRequest = {
      ...req,
      ...data,
      vendor_name: vendorName,
      approval_threshold: updatedThreshold,
      updated_at: new Date().toISOString(),
    };

    mockDb.updatePaymentRequest(updated);

    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Updated Draft Payment Request',
      entity_type: 'PaymentRequest',
      entity_id: id,
      request_code: id,
      description: `${currentUser.name} updated draft request details for ${id}.`,
    });

    return updated;
  },
};
