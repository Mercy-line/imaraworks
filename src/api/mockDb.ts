import {
  UserAccount,
  Vendor,
  PaymentRequest,
  Approval,
  PaymentAttempt,
  AuditEvent,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'imarapay_users_v1',
  VENDORS: 'imarapay_vendors_v1',
  REQUESTS: 'imarapay_requests_v1',
  APPROVALS: 'imarapay_approvals_v1',
  ATTEMPTS: 'imarapay_attempts_v1',
  AUDIT: 'imarapay_audit_v1',
};

// Initial Seed Users from Case Study
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Alice Mwangi',
    email: 'alice@imaraworks.co.ke',
    role: 'EMPLOYEE',
    department: 'Site Operations & Civil Works',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Brian Otieno',
    email: 'brian@imaraworks.co.ke',
    role: 'EMPLOYEE',
    department: 'Procurement & Site Logistics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: '2026-01-12T08:30:00Z',
  },
  {
    id: 'usr-3',
    name: 'Carol Wanjiku',
    email: 'carol@imaraworks.co.ke',
    role: 'MANAGER',
    department: 'Operations & Engineering Management',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: '2026-01-05T09:00:00Z',
  },
  {
    id: 'usr-4',
    name: 'David Mutua',
    email: 'david@imaraworks.co.ke',
    role: 'MANAGER',
    department: 'Project Delivery & Commercial',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: '2026-01-05T09:15:00Z',
  },
  {
    id: 'usr-5',
    name: 'Faith Njeri',
    email: 'faith@imaraworks.co.ke',
    role: 'FINANCE',
    department: 'Finance, Treasury & Disbursements',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: '2026-01-03T08:00:00Z',
  },
  {
    id: 'usr-6',
    name: 'Grace Kamau',
    email: 'grace@imaraworks.co.ke',
    role: 'ADMIN',
    department: 'Corporate IT & Systems Governance',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: '2026-01-01T08:00:00Z',
  },
];

// Initial Seed Vendors from Case Study
export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-1',
    name: 'Metro Hardware Ltd.',
    service_type: 'Construction materials',
    contact_person: 'James Kariuki',
    email: 'sales@metrohardware.co.ke',
    phone: '+254 722 100 200',
    bank_name: 'Equity Bank Kenya',
    bank_account_no: '0180299381920',
    mpesa_paybill_or_till: '247247 (Acc: METRO)',
    status: 'ACTIVE',
    total_paid: 184500,
    payment_requests_count: 5,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'vnd-2',
    name: 'Prime Cement Supplies',
    service_type: 'Cement',
    contact_person: 'Mary Wambui',
    email: 'orders@primecement.co.ke',
    phone: '+254 733 400 500',
    bank_name: 'KCB Bank',
    bank_account_no: '1120938475',
    mpesa_paybill_or_till: '522522 (Acc: PRIMECEM)',
    status: 'ACTIVE',
    total_paid: 630000,
    payment_requests_count: 4,
    created_at: '2026-01-11T11:00:00Z',
  },
  {
    id: 'vnd-3',
    name: 'SwiftHaul Logistics',
    service_type: 'Transport',
    contact_person: 'Hassan Noor',
    email: 'dispatch@swifthaul.co.ke',
    phone: '+254 711 900 800',
    bank_name: 'Co-operative Bank',
    bank_account_no: '01128374659200',
    mpesa_paybill_or_till: '400200 (Acc: SWIFT)',
    status: 'ACTIVE',
    total_paid: 215000,
    payment_requests_count: 6,
    created_at: '2026-01-12T09:30:00Z',
  },
  {
    id: 'vnd-4',
    name: 'PowerHire Kenya',
    service_type: 'Equipment rental',
    contact_person: 'Peter Ochieng',
    email: 'rentals@powerhire.co.ke',
    phone: '+254 724 555 888',
    bank_name: 'Stanbic Bank',
    bank_account_no: '010098473625',
    mpesa_paybill_or_till: '600100 (Acc: PWHIRE)',
    status: 'ACTIVE',
    total_paid: 126000,
    payment_requests_count: 3,
    created_at: '2026-01-15T14:00:00Z',
  },
  {
    id: 'vnd-5',
    name: 'Apex Electricals',
    service_type: 'Electrical materials',
    contact_person: 'Sarah Nduta',
    email: 'info@apexelectricals.co.ke',
    phone: '+254 720 333 444',
    bank_name: 'NCBA Bank Kenya',
    bank_account_no: '7829103847',
    mpesa_paybill_or_till: '888880 (Acc: APEX)',
    status: 'ACTIVE',
    total_paid: 388000,
    payment_requests_count: 4,
    created_at: '2026-01-18T10:15:00Z',
  },
  {
    id: 'vnd-6',
    name: 'BlueLine Plumbing',
    service_type: 'Plumbing services',
    contact_person: 'George Kimani',
    email: 'accounts@blueline.co.ke',
    phone: '+254 712 777 999',
    bank_name: 'Absa Bank Kenya',
    bank_account_no: '0309827364',
    mpesa_paybill_or_till: '303030 (Acc: BLUELINE)',
    status: 'ACTIVE',
    total_paid: 105000,
    payment_requests_count: 3,
    created_at: '2026-01-20T12:00:00Z',
  },
];

export const INITIAL_REQUESTS: PaymentRequest[] = [
  {
    id: 'PR-000101',
    vendor_id: 'vnd-1',
    vendor_name: 'Metro Hardware Ltd.',
    amount: 24500,
    currency: 'KES',
    invoice_number: 'INV-1032',
    reason: 'Site materials and binding wire for Kilimani Plaza structural casting',
    project_department: 'Kilimani Plaza Commercial Build',
    requested_payment_method: 'M-Pesa',
    requested_payment_date: '2026-09-29',
    supporting_notes: 'Urgent site delivery required before 8am pour. Approved against site requisition form #441.',
    attachment_name: 'INV-1032_MetroHardware_Receipt.pdf',
    attachment_size: '1.2 MB',
    requester_id: 'usr-1',
    requester_name: 'Alice Mwangi',
    requester_email: 'alice@imaraworks.co.ke',
    requester_department: 'Site Operations & Civil Works',
    status: 'PENDING_APPROVAL',
    approval_threshold: 'SINGLE_MANAGER',
    current_approval_step: 'MANAGER_STEP',
    created_at: '2026-09-28T08:15:00Z',
    updated_at: '2026-09-28T08:20:00Z',
    submitted_at: '2026-09-28T08:20:00Z',
  },
  {
    id: 'PR-000102',
    vendor_id: 'vnd-3',
    vendor_name: 'SwiftHaul Logistics',
    amount: 67000,
    currency: 'KES',
    invoice_number: 'SH-820',
    reason: 'Material transport & flatbed haulage of steel reinforcements from Mombasa port depot to Athi River site',
    project_department: 'Athi River Warehouse Phase 2',
    requested_payment_method: 'Bank Transfer',
    requested_payment_date: '2026-09-30',
    supporting_notes: 'Consignment delivery notes signed by gate security on Sept 27th.',
    attachment_name: 'SH-820_Waybill_Consignment.pdf',
    attachment_size: '2.4 MB',
    requester_id: 'usr-2',
    requester_name: 'Brian Otieno',
    requester_email: 'brian@imaraworks.co.ke',
    requester_department: 'Procurement & Site Logistics',
    status: 'PENDING_APPROVAL',
    approval_threshold: 'MANAGER_AND_FINANCE',
    current_approval_step: 'FINANCE_STEP',
    created_at: '2026-09-27T10:00:00Z',
    updated_at: '2026-09-28T09:30:00Z',
    submitted_at: '2026-09-27T10:15:00Z',
  },
  {
    id: 'PR-000103',
    vendor_id: 'vnd-5',
    vendor_name: 'Apex Electricals',
    amount: 148000,
    currency: 'KES',
    invoice_number: 'AE-4103',
    reason: 'Electrical installation conduits, distribution boards, and heavy-duty 3-phase cabling',
    project_department: 'Riverside Luxury Residences',
    requested_payment_method: 'Bank Transfer',
    requested_payment_date: '2026-09-28',
    supporting_notes: 'Milestone 2 electrical inspection cleared by Nairobi County building inspector.',
    attachment_name: 'AE-4103_TaxInvoice_Signed.pdf',
    attachment_size: '3.1 MB',
    requester_id: 'usr-1',
    requester_name: 'Alice Mwangi',
    requester_email: 'alice@imaraworks.co.ke',
    requester_department: 'Site Operations & Civil Works',
    status: 'APPROVED',
    approval_threshold: 'MANAGER_AND_FINANCE',
    current_approval_step: 'COMPLETED',
    created_at: '2026-09-26T11:00:00Z',
    updated_at: '2026-09-27T16:00:00Z',
    submitted_at: '2026-09-26T11:30:00Z',
    approved_at: '2026-09-27T16:00:00Z',
  },
  {
    id: 'PR-000104',
    vendor_id: 'vnd-4',
    vendor_name: 'PowerHire Kenya',
    amount: 42000,
    currency: 'KES',
    invoice_number: 'PH-912',
    reason: 'CAT 320 Hydraulic Excavator rental for 3 days foundation trenching',
    project_department: 'Tatu City Industrial Park',
    requested_payment_method: 'M-Pesa',
    requested_payment_date: '2026-09-25',
    supporting_notes: 'Equipment log sheet signed by plant operator. Includes 50L diesel refuel adjustment.',
    attachment_name: 'PH-912_Machinery_Worksheet.pdf',
    attachment_size: '1.8 MB',
    requester_id: 'usr-2',
    requester_name: 'Brian Otieno',
    requester_email: 'brian@imaraworks.co.ke',
    requester_department: 'Procurement & Site Logistics',
    status: 'PAID',
    approval_threshold: 'SINGLE_MANAGER',
    current_approval_step: 'COMPLETED',
    created_at: '2026-09-24T09:00:00Z',
    updated_at: '2026-09-25T14:45:00Z',
    submitted_at: '2026-09-24T09:20:00Z',
    approved_at: '2026-09-24T15:30:00Z',
    paid_at: '2026-09-25T14:45:00Z',
  },
  {
    id: 'PR-000105',
    vendor_id: 'vnd-2',
    vendor_name: 'Prime Cement Supplies',
    amount: 210000,
    currency: 'KES',
    invoice_number: 'PCS-9011',
    reason: '400 bags Savanna 42.5N Structural Portland Cement delivery for column casting',
    project_department: 'Westlands Corporate Tower',
    requested_payment_method: 'Bank Transfer',
    requested_payment_date: '2026-09-24',
    supporting_notes: 'Batch test certificate attached. Quality verified by lab testing.',
    attachment_name: 'PCS-9011_Cement_Batch_Certificate.pdf',
    attachment_size: '4.5 MB',
    requester_id: 'usr-1',
    requester_name: 'Alice Mwangi',
    requester_email: 'alice@imaraworks.co.ke',
    requester_department: 'Site Operations & Civil Works',
    status: 'PAID',
    approval_threshold: 'MANAGER_AND_FINANCE',
    current_approval_step: 'COMPLETED',
    created_at: '2026-09-22T08:00:00Z',
    updated_at: '2026-09-24T11:20:00Z',
    submitted_at: '2026-09-22T08:30:00Z',
    approved_at: '2026-09-23T14:00:00Z',
    paid_at: '2026-09-24T11:20:00Z',
  },
  {
    id: 'PR-000106',
    vendor_id: 'vnd-6',
    vendor_name: 'BlueLine Plumbing',
    amount: 35000,
    currency: 'KES',
    invoice_number: 'BLP-404',
    reason: 'Drainage pipe fixtures, HDPE couplings and waste interceptors installation',
    project_department: 'Kilimani Plaza Commercial Build',
    requested_payment_method: 'M-Pesa',
    requested_payment_date: '2026-09-26',
    supporting_notes: 'Urgent plumbing inspection fix.',
    attachment_name: 'BLP-404_Invoice.pdf',
    attachment_size: '950 KB',
    requester_id: 'usr-2',
    requester_name: 'Brian Otieno',
    requester_email: 'brian@imaraworks.co.ke',
    requester_department: 'Procurement & Site Logistics',
    status: 'REJECTED',
    approval_threshold: 'SINGLE_MANAGER',
    current_approval_step: 'MANAGER_STEP',
    rejection_reason: 'Invoice amount does not match site delivery note PO-210. 10 couplings were reported missing upon delivery inspection.',
    rejection_by: 'Carol Wanjiku',
    rejection_by_role: 'MANAGER',
    rejection_at: '2026-09-26T14:15:00Z',
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-26T14:15:00Z',
    submitted_at: '2026-09-26T10:15:00Z',
  },
  {
    id: 'PR-000107',
    vendor_id: 'vnd-3',
    vendor_name: 'SwiftHaul Logistics',
    amount: 54000,
    currency: 'KES',
    invoice_number: 'SH-845',
    reason: 'Ballast gravel haulage (3 tipper trucks) to Westlands site foundation fill',
    project_department: 'Westlands Corporate Tower',
    requested_payment_method: 'Bank Transfer',
    requested_payment_date: '2026-09-28',
    supporting_notes: 'Weighbridge tickets attached.',
    attachment_name: 'SH-845_Weighbridge_Records.pdf',
    attachment_size: '1.5 MB',
    requester_id: 'usr-1',
    requester_name: 'Alice Mwangi',
    requester_email: 'alice@imaraworks.co.ke',
    requester_department: 'Site Operations & Civil Works',
    status: 'FAILED',
    approval_threshold: 'MANAGER_AND_FINANCE',
    current_approval_step: 'COMPLETED',
    created_at: '2026-09-27T08:00:00Z',
    updated_at: '2026-09-28T11:00:00Z',
    submitted_at: '2026-09-27T08:30:00Z',
    approved_at: '2026-09-27T17:00:00Z',
  },
  {
    id: 'PR-000108',
    vendor_id: 'vnd-1',
    vendor_name: 'Metro Hardware Ltd.',
    amount: 18200,
    currency: 'KES',
    invoice_number: 'INV-1055',
    reason: 'High-tensile anchor bolts and epoxy chemical anchors for steel framing',
    project_department: 'Kilimani Plaza Commercial Build',
    requested_payment_method: 'M-Pesa',
    requested_payment_date: '2026-10-01',
    supporting_notes: 'Draft requisition waiting for engineer sign-off on bolt dimensions.',
    requester_id: 'usr-1',
    requester_name: 'Alice Mwangi',
    requester_email: 'alice@imaraworks.co.ke',
    requester_department: 'Site Operations & Civil Works',
    status: 'DRAFT',
    approval_threshold: 'SINGLE_MANAGER',
    current_approval_step: 'NONE',
    created_at: '2026-09-28T11:30:00Z',
    updated_at: '2026-09-28T11:30:00Z',
  },
  {
    id: 'PR-000109',
    vendor_id: 'vnd-4',
    vendor_name: 'PowerHire Kenya',
    amount: 85000,
    currency: 'KES',
    invoice_number: 'PH-950',
    reason: '50-tonne Mobile Crane hire for roof truss placement (2 days)',
    project_department: 'Athi River Warehouse Phase 2',
    requested_payment_method: 'Bank Transfer',
    requested_payment_date: '2026-10-02',
    supporting_notes: 'Operator certified under OSHA safety regulations.',
    attachment_name: 'PH-950_CraneHire_Quote.pdf',
    attachment_size: '2.1 MB',
    requester_id: 'usr-2',
    requester_name: 'Brian Otieno',
    requester_email: 'brian@imaraworks.co.ke',
    requester_department: 'Procurement & Site Logistics',
    status: 'PENDING_APPROVAL',
    approval_threshold: 'MANAGER_AND_FINANCE',
    current_approval_step: 'MANAGER_STEP',
    created_at: '2026-09-28T12:00:00Z',
    updated_at: '2026-09-28T12:10:00Z',
    submitted_at: '2026-09-28T12:10:00Z',
  },
  {
    id: 'PR-000110',
    vendor_id: 'vnd-5',
    vendor_name: 'Apex Electricals',
    amount: 39500,
    currency: 'KES',
    invoice_number: 'AE-4155',
    reason: 'Sub-distribution breaker boxes and surge arrestors for generator backup',
    project_department: 'Head Office Operations',
    requested_payment_method: 'M-Pesa',
    requested_payment_date: '2026-09-29',
    supporting_notes: 'Requested for HQ server room power redundancy upgrade.',
    attachment_name: 'AE-4155_Breaker_Invoice.pdf',
    attachment_size: '1.1 MB',
    requester_id: 'usr-1',
    requester_name: 'Alice Mwangi',
    requester_email: 'alice@imaraworks.co.ke',
    requester_department: 'Site Operations & Civil Works',
    status: 'APPROVED',
    approval_threshold: 'SINGLE_MANAGER',
    current_approval_step: 'COMPLETED',
    created_at: '2026-09-27T14:00:00Z',
    updated_at: '2026-09-28T10:00:00Z',
    submitted_at: '2026-09-27T14:20:00Z',
    approved_at: '2026-09-28T10:00:00Z',
  },
];

export const INITIAL_APPROVALS: Approval[] = [
  // PR-000101 (Pending Manager approval)
  {
    id: 'app-101-1',
    payment_request_id: 'PR-000101',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'PENDING',
  },
  // PR-000102 (Manager Carol approved, Finance Faith pending)
  {
    id: 'app-102-1',
    payment_request_id: 'PR-000102',
    approver_id: 'usr-3',
    approver_name: 'Carol Wanjiku',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-28T09:30:00Z',
    comments: 'Verified delivery slips against Athi River project bill of quantities.',
  },
  {
    id: 'app-102-2',
    payment_request_id: 'PR-000102',
    approver_role: 'FINANCE',
    step_number: 2,
    decision: 'PENDING',
  },
  // PR-000103 (Carol Approved + Faith Approved)
  {
    id: 'app-103-1',
    payment_request_id: 'PR-000103',
    approver_id: 'usr-3',
    approver_name: 'Carol Wanjiku',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-27T11:00:00Z',
    comments: 'Electrical work inspected on-site by consulting engineer.',
  },
  {
    id: 'app-103-2',
    payment_request_id: 'PR-000103',
    approver_id: 'usr-5',
    approver_name: 'Faith Njeri',
    approver_role: 'FINANCE',
    step_number: 2,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-27T16:00:00Z',
    comments: 'Tax compliance verified on KRA iTax portal. Bank details matched with vendor master.',
  },
  // PR-000104 (David Mutua approved <= 50k)
  {
    id: 'app-104-1',
    payment_request_id: 'PR-000104',
    approver_id: 'usr-4',
    approver_name: 'David Mutua',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-24T15:30:00Z',
    comments: 'Excavator usage log sheet verified.',
  },
  // PR-000105 (Carol Approved + Faith Approved)
  {
    id: 'app-105-1',
    payment_request_id: 'PR-000105',
    approver_id: 'usr-3',
    approver_name: 'Carol Wanjiku',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-23T09:15:00Z',
    comments: 'High grade structural cement approved for high-rise columns.',
  },
  {
    id: 'app-105-2',
    payment_request_id: 'PR-000105',
    approver_id: 'usr-5',
    approver_name: 'Faith Njeri',
    approver_role: 'FINANCE',
    step_number: 2,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-23T14:00:00Z',
    comments: 'Payment within project cashflow allocation.',
  },
  // PR-000106 (Carol Rejected)
  {
    id: 'app-106-1',
    payment_request_id: 'PR-000106',
    approver_id: 'usr-3',
    approver_name: 'Carol Wanjiku',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'REJECTED',
    rejection_reason: 'Invoice amount does not match site delivery note PO-210. 10 couplings were reported missing upon delivery inspection.',
    decision_timestamp: '2026-09-26T14:15:00Z',
  },
  // PR-000107 (David Approved + Faith Approved)
  {
    id: 'app-107-1',
    payment_request_id: 'PR-000107',
    approver_id: 'usr-4',
    approver_name: 'David Mutua',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-27T14:00:00Z',
  },
  {
    id: 'app-107-2',
    payment_request_id: 'PR-000107',
    approver_id: 'usr-5',
    approver_name: 'Faith Njeri',
    approver_role: 'FINANCE',
    step_number: 2,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-27T17:00:00Z',
  },
  // PR-000109 (Carol pending manager approval)
  {
    id: 'app-109-1',
    payment_request_id: 'PR-000109',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'PENDING',
  },
  {
    id: 'app-109-2',
    payment_request_id: 'PR-000109',
    approver_role: 'FINANCE',
    step_number: 2,
    decision: 'PENDING',
  },
  // PR-000110 (David Mutua approved <= 50k)
  {
    id: 'app-110-1',
    payment_request_id: 'PR-000110',
    approver_id: 'usr-4',
    approver_name: 'David Mutua',
    approver_role: 'MANAGER',
    step_number: 1,
    decision: 'APPROVED',
    decision_timestamp: '2026-09-28T10:00:00Z',
    comments: 'Critical facility electrical works.',
  },
];

export const INITIAL_ATTEMPTS: PaymentAttempt[] = [
  // PR-000104 (Paid via M-Pesa)
  {
    id: 'att-104-1',
    payment_request_id: 'PR-000104',
    initiated_by_id: 'usr-5',
    initiated_by_name: 'Faith Njeri',
    idempotency_key: 'IDEMP-PR104-74920481',
    provider: 'MOCK_MPESA',
    amount: 42000,
    currency: 'KES',
    status: 'SUCCESS',
    provider_reference: 'MPESA-QGH7291',
    reconciliation_status: 'NOT_REQUIRED',
    initiated_at: '2026-09-25T14:44:12Z',
    completed_at: '2026-09-25T14:45:01Z',
    retry_count: 0,
  },
  // PR-000105 (Paid via Bank Transfer)
  {
    id: 'att-105-1',
    payment_request_id: 'PR-000105',
    initiated_by_id: 'usr-5',
    initiated_by_name: 'Faith Njeri',
    idempotency_key: 'IDEMP-PR105-99281740',
    provider: 'MOCK_BANK',
    amount: 210000,
    currency: 'KES',
    status: 'SUCCESS',
    provider_reference: 'BNK-TRF-90218',
    reconciliation_status: 'NOT_REQUIRED',
    initiated_at: '2026-09-24T11:18:40Z',
    completed_at: '2026-09-24T11:20:15Z',
    retry_count: 0,
  },
  // PR-000107 (Failed / Provider Timeout)
  {
    id: 'att-107-1',
    payment_request_id: 'PR-000107',
    initiated_by_id: 'usr-5',
    initiated_by_name: 'Faith Njeri',
    idempotency_key: 'IDEMP-PR107-55418920',
    provider: 'MOCK_BANK',
    amount: 54000,
    currency: 'KES',
    status: 'TIMEOUT_AMBIGUOUS',
    failure_reason: 'Provider gateway timeout (HTTP 504 Gateway Timeout). Transaction status unconfirmed by bank core system.',
    reconciliation_status: 'PENDING_VERIFICATION',
    reconciliation_notes: 'Do not re-initiate payment directly. Run reconciliation check to confirm debit status.',
    initiated_at: '2026-09-28T10:58:30Z',
    completed_at: '2026-09-28T11:00:00Z',
    retry_count: 0,
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-28T08:15:00Z',
    actor_id: 'usr-1',
    actor_name: 'Alice Mwangi',
    actor_role: 'EMPLOYEE',
    action: 'Created payment request',
    entity_type: 'PaymentRequest',
    entity_id: 'PR-000101',
    request_code: 'PR-000101',
    description: 'Alice Mwangi drafted payment request PR-000101 for Metro Hardware Ltd. (KES 24,500)',
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-28T08:20:00Z',
    actor_id: 'usr-1',
    actor_name: 'Alice Mwangi',
    actor_role: 'EMPLOYEE',
    action: 'Submitted payment request',
    entity_type: 'PaymentRequest',
    entity_id: 'PR-000101',
    request_code: 'PR-000101',
    description: 'Submitted for manager approval (Threshold: <= KES 50,000 single manager)',
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-27T10:15:00Z',
    actor_id: 'usr-2',
    actor_name: 'Brian Otieno',
    actor_role: 'EMPLOYEE',
    action: 'Submitted payment request',
    entity_type: 'PaymentRequest',
    entity_id: 'PR-000102',
    request_code: 'PR-000102',
    description: 'Submitted for multi-tier approval: SwiftHaul Logistics (KES 67,000)',
  },
  {
    id: 'aud-004',
    timestamp: '2026-09-28T09:30:00Z',
    actor_id: 'usr-3',
    actor_name: 'Carol Wanjiku',
    actor_role: 'MANAGER',
    action: 'Approved payment (Manager Tier)',
    entity_type: 'Approval',
    entity_id: 'app-102-1',
    request_code: 'PR-000102',
    description: 'Carol Wanjiku approved Tier 1 manager stage. Routed to Finance queue.',
  },
  {
    id: 'aud-005',
    timestamp: '2026-09-27T16:00:00Z',
    actor_id: 'usr-5',
    actor_name: 'Faith Njeri',
    actor_role: 'FINANCE',
    action: 'Approved payment (Finance Tier)',
    entity_type: 'Approval',
    entity_id: 'app-103-2',
    request_code: 'PR-000103',
    description: 'Faith Njeri completed final finance approval. Status updated to APPROVED.',
  },
  {
    id: 'aud-006',
    timestamp: '2026-09-25T14:44:12Z',
    actor_id: 'usr-5',
    actor_name: 'Faith Njeri',
    actor_role: 'FINANCE',
    action: 'Payment processing started',
    entity_type: 'PaymentAttempt',
    entity_id: 'att-104-1',
    request_code: 'PR-000104',
    description: 'Initiated M-Pesa disbursement via mock payment provider (KES 42,000)',
  },
  {
    id: 'aud-007',
    timestamp: '2026-09-25T14:45:01Z',
    actor_id: 'usr-5',
    actor_name: 'System / Provider',
    actor_role: 'SYSTEM',
    action: 'Payment completed',
    entity_type: 'PaymentAttempt',
    entity_id: 'att-104-1',
    request_code: 'PR-000104',
    description: 'Payment successfully processed. Provider reference: MPESA-QGH7291',
  },
  {
    id: 'aud-008',
    timestamp: '2026-09-26T14:15:00Z',
    actor_id: 'usr-3',
    actor_name: 'Carol Wanjiku',
    actor_role: 'MANAGER',
    action: 'Rejected payment request',
    entity_type: 'Approval',
    entity_id: 'app-106-1',
    request_code: 'PR-000106',
    description: 'Carol Wanjiku rejected PR-000106. Reason: "Invoice amount does not match site delivery note PO-210."',
  },
  {
    id: 'aud-009',
    timestamp: '2026-09-28T11:00:00Z',
    actor_id: 'usr-5',
    actor_name: 'Faith Njeri',
    actor_role: 'FINANCE',
    action: 'Payment attempt timed out (Ambiguous)',
    entity_type: 'PaymentAttempt',
    entity_id: 'att-107-1',
    request_code: 'PR-000107',
    description: 'Provider timeout. Safe retry guard enabled; marked for provider status reconciliation.',
  },
];

// Helper database manager with localStorage sync
class MockDatabase {
  private users: UserAccount[] = [];
  private vendors: Vendor[] = [];
  private requests: PaymentRequest[] = [];
  private approvals: Approval[] = [];
  private attempts: PaymentAttempt[] = [];
  private auditEvents: AuditEvent[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.users = this.loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.vendors = this.loadFromStorage(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
    this.requests = this.loadFromStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    this.approvals = this.loadFromStorage(STORAGE_KEYS.APPROVALS, INITIAL_APPROVALS);
    this.attempts = this.loadFromStorage(STORAGE_KEYS.ATTEMPTS, INITIAL_ATTEMPTS);
    this.auditEvents = this.loadFromStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_EVENTS);
  }

  private loadFromStorage<T>(key: string, defaultVal: T[]): T[] {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }

  private saveToStorage<T>(key: string, data: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  public resetToFactoryDefaults() {
    this.users = [...INITIAL_USERS];
    this.vendors = [...INITIAL_VENDORS];
    this.requests = [...INITIAL_REQUESTS];
    this.approvals = [...INITIAL_APPROVALS];
    this.attempts = [...INITIAL_ATTEMPTS];
    this.auditEvents = [...INITIAL_AUDIT_EVENTS];

    this.saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.saveToStorage(STORAGE_KEYS.VENDORS, this.vendors);
    this.saveToStorage(STORAGE_KEYS.REQUESTS, this.requests);
    this.saveToStorage(STORAGE_KEYS.APPROVALS, this.approvals);
    this.saveToStorage(STORAGE_KEYS.ATTEMPTS, this.attempts);
    this.saveToStorage(STORAGE_KEYS.AUDIT, this.auditEvents);
  }

  // Users
  public getUsers(): UserAccount[] {
    return [...this.users];
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUser(user: UserAccount): UserAccount {
    this.users = this.users.map((u) => (u.id === user.id ? user : u));
    this.saveToStorage(STORAGE_KEYS.USERS, this.users);
    return user;
  }

  // Vendors
  public getVendors(): Vendor[] {
    return [...this.vendors];
  }

  public getVendorById(id: string): Vendor | undefined {
    return this.vendors.find((v) => v.id === id);
  }

  public createVendor(vendorData: Omit<Vendor, 'id' | 'created_at' | 'total_paid' | 'payment_requests_count'>): Vendor {
    const newVendor: Vendor = {
      ...vendorData,
      id: `vnd-${Date.now().toString().slice(-4)}`,
      total_paid: 0,
      payment_requests_count: 0,
      created_at: new Date().toISOString(),
    };
    this.vendors.unshift(newVendor);
    this.saveToStorage(STORAGE_KEYS.VENDORS, this.vendors);
    return newVendor;
  }

  public updateVendor(vendor: Vendor): Vendor {
    this.vendors = this.vendors.map((v) => (v.id === vendor.id ? vendor : v));
    this.saveToStorage(STORAGE_KEYS.VENDORS, this.vendors);
    return vendor;
  }

  // Payment Requests
  public getPaymentRequests(): PaymentRequest[] {
    return [...this.requests];
  }

  public getPaymentRequestById(id: string): PaymentRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  public findDuplicateInvoice(vendorId: string, invoiceNumber: string, excludeRequestId?: string): PaymentRequest | undefined {
    const cleanInvoice = invoiceNumber.trim().toLowerCase();
    return this.requests.find(
      (r) =>
        r.vendor_id === vendorId &&
        r.invoice_number.trim().toLowerCase() === cleanInvoice &&
        r.id !== excludeRequestId &&
        r.status !== 'REJECTED'
    );
  }

  public createPaymentRequest(req: PaymentRequest): PaymentRequest {
    this.requests.unshift(req);
    this.saveToStorage(STORAGE_KEYS.REQUESTS, this.requests);

    // Update vendor count
    const vendor = this.getVendorById(req.vendor_id);
    if (vendor) {
      vendor.payment_requests_count += 1;
      this.updateVendor(vendor);
    }

    return req;
  }

  public updatePaymentRequest(req: PaymentRequest): PaymentRequest {
    this.requests = this.requests.map((r) => (r.id === req.id ? req : r));
    this.saveToStorage(STORAGE_KEYS.REQUESTS, this.requests);
    return req;
  }

  // Approvals
  public getApprovals(requestId?: string): Approval[] {
    if (requestId) {
      return this.approvals.filter((a) => a.payment_request_id === requestId);
    }
    return [...this.approvals];
  }

  public addApproval(app: Approval): Approval {
    this.approvals.push(app);
    this.saveToStorage(STORAGE_KEYS.APPROVALS, this.approvals);
    return app;
  }

  public updateApproval(app: Approval): Approval {
    this.approvals = this.approvals.map((a) => (a.id === app.id ? app : a));
    this.saveToStorage(STORAGE_KEYS.APPROVALS, this.approvals);
    return app;
  }

  // Payment Attempts
  public getAttempts(requestId?: string): PaymentAttempt[] {
    if (requestId) {
      return this.attempts.filter((a) => a.payment_request_id === requestId);
    }
    return [...this.attempts];
  }

  public addAttempt(attempt: PaymentAttempt): PaymentAttempt {
    this.attempts.unshift(attempt);
    this.saveToStorage(STORAGE_KEYS.ATTEMPTS, this.attempts);
    return attempt;
  }

  public updateAttempt(attempt: PaymentAttempt): PaymentAttempt {
    this.attempts = this.attempts.map((a) => (a.id === attempt.id ? attempt : a));
    this.saveToStorage(STORAGE_KEYS.ATTEMPTS, this.attempts);
    return attempt;
  }

  // Audit Events
  public getAuditEvents(requestId?: string): AuditEvent[] {
    if (requestId) {
      return this.auditEvents.filter((a) => a.request_code === requestId || a.entity_id === requestId);
    }
    return [...this.auditEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditEvents.unshift(newEvent);
    this.saveToStorage(STORAGE_KEYS.AUDIT, this.auditEvents);
    return newEvent;
  }
}

export const mockDb = new MockDatabase();
