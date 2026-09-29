import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { Vendor, PaymentRequest } from '../../../types';
import { vendorsApi } from '../../../api/vendorsApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { formatKES } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { DuplicateWarningCard } from './DuplicateWarningCard';
import { LoadingState } from '../../common/LoadingState';
import {
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Send,
  Save,
  ArrowLeft,
  Upload,
  Info,
} from 'lucide-react';

const PROJECTS = [
  'Kilimani Plaza Commercial Build',
  'Riverside Luxury Residences',
  'Athi River Warehouse Phase 2',
  'Tatu City Industrial Park',
  'Westlands Corporate Tower',
  'Head Office Operations',
  'Plant & Equipment Fleet',
];

export const PaymentRequestCreate: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [reason, setReason] = useState('');
  const [project, setProject] = useState(PROJECTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Bank Transfer'>('M-Pesa');
  const [requestedDate, setRequestedDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [supportingNotes, setSupportingNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  // Duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState<PaymentRequest | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadVendors() {
      try {
        const v = await vendorsApi.getVendors();
        setVendors(v.filter((x) => x.status === 'ACTIVE'));
        if (v.length > 0) {
          setVendorId(v[0].id);
        }
      } catch (err) {
        console.error('Failed to load vendors:', err);
      } finally {
        setIsLoadingVendors(false);
      }
    }
    loadVendors();
  }, []);

  // Check duplicate invoice whenever vendorId or invoiceNumber changes
  useEffect(() => {
    async function checkDuplicate() {
      if (vendorId && invoiceNumber.trim().length >= 3) {
        try {
          const res = await paymentsApi.checkDuplicateInvoice(vendorId, invoiceNumber.trim());
          if (res.isDuplicate && res.existingRequest) {
            setDuplicateWarning(res.existingRequest);
          } else {
            setDuplicateWarning(null);
          }
        } catch {
          // ignore check error
        }
      } else {
        setDuplicateWarning(null);
      }
    }
    const debounce = setTimeout(checkDuplicate, 300);
    return () => clearTimeout(debounce);
  }, [vendorId, invoiceNumber]);

  const numericAmount = parseFloat(amount) || 0;
  const isMultiTier = numericAmount > 50000;

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!vendorId) errs.vendorId = 'Please select a registered vendor.';
    if (!amount || numericAmount <= 0) errs.amount = 'Please enter a valid positive payment amount.';
    if (!invoiceNumber.trim()) errs.invoiceNumber = 'Invoice or reference number is required.';
    if (!reason.trim()) errs.reason = 'Reason/purpose for payment is required.';
    if (!project) errs.project = 'Please select the associated project or department.';
    if (!requestedDate) errs.requestedDate = 'Requested payment disbursement date is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (submitNow: boolean) => {
    if (!validateForm()) {
      showToast('error', 'Form Incomplete', 'Please correct the highlighted fields before proceeding.');
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const created = await paymentsApi.createPaymentRequest(
        {
          vendor_id: vendorId,
          amount: numericAmount,
          invoice_number: invoiceNumber.trim(),
          reason: reason.trim(),
          project_department: project,
          requested_payment_method: paymentMethod,
          requested_payment_date: requestedDate,
          supporting_notes: supportingNotes.trim(),
          attachment_name: attachmentName || 'Invoice_Document.pdf',
          submit_now: submitNow,
        },
        currentUser
      );

      showToast(
        'success',
        submitNow ? 'Payment Request Submitted' : 'Draft Saved',
        `${created.id} has been ${submitNow ? 'submitted for manager approval' : 'saved as draft'}.`
      );

      navigateTo('payment-detail', created.id);
    } catch (err: any) {
      showToast('error', 'Creation Failed', err.message || 'Could not save payment request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVendorObj = vendors.find((v) => v.id === vendorId);

  if (isLoadingVendors) {
    return <LoadingState type="page" text="Loading vendor catalog..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('payments')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to Payment Requests"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Create Payment Request
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Requisition payment for contractor materials, logistics, equipment, or subcontractor services
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
        {/* Duplicate Invoice Warning */}
        {duplicateWarning && (
          <DuplicateWarningCard
            existingRequest={duplicateWarning}
            onViewExisting={() => navigateTo('payment-detail', duplicateWarning.id)}
          />
        )}

        {/* Dynamic Approval Threshold Notice */}
        <div
          className={`p-4 rounded-xl border transition-colors flex items-start gap-3 ${
            isMultiTier
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="pt-0.5">
            {isMultiTier ? (
              <ShieldCheck size={18} className="text-purple-700" />
            ) : (
              <UserCheck size={18} className="text-indigo-700" />
            )}
          </div>
          <div className="text-xs">
            <h5 className="font-bold">
              {isMultiTier
                ? 'Two-Tier Approval Workflow (> KES 50,000)'
                : 'Single-Tier Approval Workflow (≤ KES 50,000)'}
            </h5>
            <p className="mt-0.5 leading-relaxed">
              {isMultiTier
                ? 'Payments above KES 50,000 require approval from a manager and Finance.'
                : 'Payments of KES 50,000 or less require approval from one manager.'}
            </p>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vendor Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Vendor / Contractor <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={vendorId}
                onChange={(e) => {
                  setVendorId(e.target.value);
                  if (errors.vendorId) setErrors({ ...errors, vendorId: '' });
                }}
                className={`w-full text-xs sm:text-sm py-2.5 px-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  errors.vendorId ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                }`}
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.service_type})
                  </option>
                ))}
              </select>
            </div>
            {errors.vendorId && <p className="text-2xs text-rose-600 mt-1">{errors.vendorId}</p>}

            {/* Vendor Payment details quick info */}
            {selectedVendorObj && (
              <p className="text-2xs text-slate-400 mt-1.5 font-mono">
                M-Pesa: {selectedVendorObj.mpesa_paybill_or_till || 'N/A'} | Bank: {selectedVendorObj.bank_name || 'N/A'}
              </p>
            )}
          </div>

          {/* Amount (KES) */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Amount (KES) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                KES
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: '' });
                }}
                placeholder="24500"
                min="1"
                step="100"
                className={`w-full text-xs sm:text-sm pl-12 pr-3.5 py-2.5 rounded-lg border font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  errors.amount ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.amount ? (
              <p className="text-2xs text-rose-600 mt-1">{errors.amount}</p>
            ) : numericAmount > 0 ? (
              <p className="text-2xs text-slate-500 mt-1">Formatted: {formatKES(numericAmount)}</p>
            ) : null}
          </div>

          {/* Invoice / Reference Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Invoice / Delivery Note Reference <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                if (errors.invoiceNumber) setErrors({ ...errors, invoiceNumber: '' });
              }}
              placeholder="e.g. INV-1032 or SH-820"
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border font-mono uppercase focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                errors.invoiceNumber ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.invoiceNumber && (
              <p className="text-2xs text-rose-600 mt-1">{errors.invoiceNumber}</p>
            )}
          </div>

          {/* Project / Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Project / Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                if (errors.project) setErrors({ ...errors, project: '' });
              }}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.project && <p className="text-2xs text-rose-600 mt-1">{errors.project}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Requested Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('M-Pesa')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'M-Pesa'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>M-Pesa</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* Requested Payment Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Requested Payment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => {
                setRequestedDate(e.target.value);
                if (errors.requestedDate) setErrors({ ...errors, requestedDate: '' });
              }}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {errors.requestedDate && (
              <p className="text-2xs text-rose-600 mt-1">{errors.requestedDate}</p>
            )}
          </div>
        </div>

        {/* Reason for Payment (Full Width Textarea) */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Reason / Purpose for Payment <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) setErrors({ ...errors, reason: '' });
            }}
            rows={2}
            placeholder="e.g. 50-tonne mobile crane hire for roof truss placement on Phase 2 warehouse..."
            className={`w-full text-xs sm:text-sm p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-slate-900 ${
              errors.reason ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
            }`}
          />
          {errors.reason && <p className="text-2xs text-rose-600 mt-1">{errors.reason}</p>}
        </div>

        {/* Supporting Notes & Document Attachment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Supporting Notes / Site Context (Optional)
            </label>
            <textarea
              value={supportingNotes}
              onChange={(e) => setSupportingNotes(e.target.value)}
              rows={3}
              placeholder="Add gate pass numbers, inspection sign-offs, or urgency details..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Supporting Invoice Attachment
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-400 transition-colors bg-slate-50/50">
              <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
              {attachmentName ? (
                <div className="text-xs font-medium text-emerald-700">
                  Attached: {attachmentName}
                  <button
                    type="button"
                    onClick={() => setAttachmentName('')}
                    className="block mx-auto text-2xs text-rose-600 hover:underline mt-1"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-700">
                    Upload PDF Invoice, Delivery Slip, or BOQ
                  </p>
                  <p className="text-2xs text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
                  <button
                    type="button"
                    onClick={() => setAttachmentName(`${invoiceNumber || 'INV'}_Supporting_Doc.pdf`)}
                    className="mt-2 text-2xs font-semibold text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded hover:bg-slate-50"
                  >
                    Attach Sample Document
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={() => navigateTo('payments')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              isLoading={isSubmitting}
              leftIcon={<Save size={15} />}
              className="flex-1 sm:flex-initial"
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              isLoading={isSubmitting}
              leftIcon={<Send size={15} />}
              className="flex-1 sm:flex-initial"
            >
              Submit for Approval
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
