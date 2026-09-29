export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'FINANCE' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  status: UserStatus;
  created_at: string;
}

export type PaymentMethod = 'M-Pesa' | 'Bank Transfer';

export interface Vendor {
  id: string;
  name: string;
  service_type: string;
  contact_person: string;
  email: string;
  phone: string;
  bank_name?: string;
  bank_account_no?: string;
  mpesa_paybill_or_till?: string;
  status: 'ACTIVE' | 'INACTIVE';
  total_paid: number;
  payment_requests_count: number;
  created_at: string;
}

export type PaymentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED';

export type ApprovalThreshold = 'SINGLE_MANAGER' | 'MANAGER_AND_FINANCE';
export type ApprovalStepState = 'NONE' | 'MANAGER_STEP' | 'FINANCE_STEP' | 'COMPLETED';

export interface PaymentRequest {
  id: string; // e.g. "PR-000101"
  vendor_id: string;
  vendor_name: string;
  amount: number;
  currency: 'KES';
  invoice_number: string;
  reason: string;
  project_department: string;
  requested_payment_method: PaymentMethod;
  requested_payment_date: string;
  supporting_notes?: string;
  attachment_name?: string;
  attachment_size?: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  requester_department: string;
  status: PaymentStatus;
  approval_threshold: ApprovalThreshold;
  current_approval_step: ApprovalStepState;
  rejection_reason?: string;
  rejection_by?: string;
  rejection_by_role?: UserRole;
  rejection_at?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  paid_at?: string;
}

export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Approval {
  id: string;
  payment_request_id: string;
  approver_id?: string;
  approver_name?: string;
  approver_role: 'MANAGER' | 'FINANCE';
  step_number: 1 | 2; // 1 for Manager, 2 for Finance (if > 50k)
  decision: ApprovalDecision;
  rejection_reason?: string;
  decision_timestamp?: string;
  comments?: string;
}

export type AttemptStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT_AMBIGUOUS';

export interface PaymentAttempt {
  id: string;
  payment_request_id: string;
  initiated_by_id: string;
  initiated_by_name: string;
  idempotency_key: string;
  provider: 'MOCK_MPESA' | 'MOCK_BANK';
  amount: number;
  currency: 'KES';
  status: AttemptStatus;
  provider_reference?: string;
  failure_reason?: string;
  reconciliation_status?: 'NOT_REQUIRED' | 'PENDING_VERIFICATION' | 'RESOLVED_SUCCESS' | 'RESOLVED_FAILED';
  reconciliation_notes?: string;
  initiated_at: string;
  completed_at?: string;
  retry_count: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: 'PaymentRequest' | 'Approval' | 'PaymentAttempt' | 'Vendor' | 'UserAccount' | 'System';
  entity_id: string;
  request_code?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface FinancialMetrics {
  total_paid_kes: number;
  pending_approvals_count: number;
  pending_approvals_kes: number;
  ready_for_processing_count: number;
  ready_for_processing_kes: number;
  failed_payments_count: number;
  failed_payments_kes: number;
  total_requests_count: number;
  draft_count: number;
  average_approval_hours: number;
}

export interface ProjectBreakdown {
  project: string;
  total_amount: number;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: PaymentStatus;
  count: number;
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  paid_amount: number;
  submitted_amount: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  total_amount: number;
  count: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaymentRequestFilters {
  search?: string;
  vendor_id?: string;
  status?: PaymentStatus | 'ALL';
  requester_id?: string;
  project?: string;
  payment_method?: PaymentMethod | 'ALL';
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}
