# ImaraPay — Vendor Payment & Approval Management System
**Client: ImaraWorks Ltd.** (Fictional medium-sized Kenyan construction company)

ImaraPay is a modern B2B financial operations web application developed to replace WhatsApp/spreadsheet-based contractor and site payment workflows with a compliant, centralized, and role-governed platform.

---

## 🏗️ Domain Model & State Machine

The frontend is architected around the Django backend domain model:
- **`UserAccount`**: Employees, Operations Managers, Finance Officers, and Administrators.
- **`Vendor`**: Registered construction contractors, materials suppliers, logistics providers, and equipment hire firms.
- **`PaymentRequest`**: Requisitions with unique codes (`PR-000101`), invoice tracking, KES currency formatting, and project categorization.
- **`Approval`**: Multi-tiered approval chains enforcing segregation of duties.
- **`PaymentAttempt`**: Idempotent disbursement logs with mock M-Pesa & Bank Transfer provider references.
- **`AuditEvent`**: Immutable security and compliance event ledger.

### Payment Lifecycle States:
```
DRAFT ──► SUBMITTED ──► PENDING APPROVAL ──► APPROVED ──► PROCESSING ──► PAID
                             │                                 │
                             ▼                                 ▼
                          REJECTED                           FAILED
                     (Mandatory Reason)               (Timeout Reconciliation)
```

---

## ⚖️ Approval Threshold Rules
- **≤ KES 50,000**: Requires approval from **One Operations Manager** (Step 1).
- **> KES 50,000**: Requires approval from **Operations Manager + Finance Officer** (Two-Tier Sequential Sign-off).
- **Anti-Self-Approval**: The system strictly prevents requesters from approving their own payment requests.
- **Mandatory Rejection Reason**: Any rejection requires a clear written explanation recorded permanently in the audit trail.
- **Idempotency & Duplicate Guard**: Live warning if a vendor + invoice number combination already exists.

---

## 👥 Case Study Demo Personas

Use the **Role Demo Switcher** in the top navigation bar or quick login pills:
1. **Alice Mwangi** (`alice@imaraworks.co.ke`) — Employee (Site Operations Lead)
2. **Brian Otieno** (`brian@imaraworks.co.ke`) — Employee (Procurement & Site Logistics)
3. **Carol Wanjiku** (`carol@imaraworks.co.ke`) — Operations Manager
4. **David Mutua** (`david@imaraworks.co.ke`) — Project Director / Manager
5. **Faith Njeri** (`faith@imaraworks.co.ke`) — Finance Officer (Treasury & Disbursements)
6. **Grace Kamau** (`grace@imaraworks.co.ke`) — Administrator (IT & Systems Governance)

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+
- npm 9+

### Commands
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript check & production build
npm run build

# Preview production build
npm run preview
```

---

## 🔌 Connecting to Django REST Framework Backend
To connect to the live Django backend, update `.env`:
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
The API services in `src/api/` (`authApi`, `paymentsApi`, `approvalsApi`, `processingApi`, `vendorsApi`, `reportsApi`, `auditApi`, `usersApi`) are fully modular and ready to consume Django endpoints.
# ImaraWorks
