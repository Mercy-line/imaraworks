import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { Vendor, PaymentRequest } from '../../../types';
import { vendorsApi } from '../../../api/vendorsApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { formatKES } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { LoadingState } from '../../common/LoadingState';
import { ErrorState } from '../../common/ErrorState';
import {
  ArrowLeft,
  Save,
  Send,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
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

export const PaymentRequestEdit: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedRequestId, navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);

  // Editable Fields
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [reason, setReason] = useState('');
  const [project, setProject] = useState(PROJECTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Bank Transfer'>('M-Pesa');
  const [requestedDate, setRequestedDate] = useState('');
  const [supportingNotes, setSupportingNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!selectedRequestId) {
        setNotFoundError(true);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [vList, reqDetails] = await Promise.all([
          vendorsApi.getVendors(),
          paymentsApi.getPaymentRequest(selectedRequestId),
        ]);
        setVendors(vList);
        const req = reqDetails.request;
        setRequest(req);

        setVendorId(req.vendor_id);
        setAmount(req.amount.toString());
        setInvoiceNumber(req.invoice_number);
        setReason(req.reason);
        setProject(req.project_department);
        setPaymentMethod(req.requested_payment_method);
        setRequestedDate(req.requested_payment_date);
        setSupportingNotes(req.supporting_notes || '');
      } catch (err) {
        console.error('Failed to load request for edit:', err);
        setNotFoundError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedRequestId]);

  if (isLoading) {
    return <LoadingState type="page" text="Loading draft request details..." />;
  }

  if (notFoundError || !request) {
    return (
      <ErrorState
        status={404}
        title="Payment Request Not Found"
        message="The requested payment record could not be found for editing."
        onRetry={() => navigateTo('payments')}
      />
    );
  }

  if (request.status !== 'DRAFT') {
    return (
      <ErrorState
        status={403}
        title="Cannot Edit Submitted Request"
        message={`Request ${request.id} is in "${request.status}" status. Under financial compliance rules, only Draft requests may be directly modified.`}
        onRetry={() => navigateTo('payment-detail', request.id)}
      />
    );
  }

  const numericAmount = parseFloat(amount) || 0;
  const isMultiTier = numericAmount > 50000;

  const handleSaveDraft = async () => {
    if (!currentUser || !request) return;
    setIsSaving(true);
    try {
      await paymentsApi.updatePaymentRequest(
        request.id,
        {
          vendor_id: vendorId,
          amount: numericAmount,
          invoice_number: invoiceNumber.trim(),
          reason: reason.trim(),
          project_department: project,
          requested_payment_method: paymentMethod,
          requested_payment_date: requestedDate,
          supporting_notes: supportingNotes.trim(),
        },
        currentUser
      );

      showToast('success', 'Draft Updated', `Changes saved to ${request.id}.`);
      navigateTo('payment-detail', request.id);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !request) return;
    setIsSaving(true);
    try {
      await paymentsApi.updatePaymentRequest(
        request.id,
        {
          vendor_id: vendorId,
          amount: numericAmount,
          invoice_number: invoiceNumber.trim(),
          reason: reason.trim(),
          project_department: project,
          requested_payment_method: paymentMethod,
          requested_payment_date: requestedDate,
          supporting_notes: supportingNotes.trim(),
        },
        currentUser
      );

      await paymentsApi.submitPaymentRequest(request.id, currentUser);
      showToast('success', 'Request Submitted', `${request.id} submitted for manager review.`);
      navigateTo('payment-detail', request.id);
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('payment-detail', request.id)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Edit Draft: {request.id}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify requisition parameters before submitting to the approval hierarchy
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
        {/* Threshold Banner */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Vendor / Contractor
            </label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.service_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Amount (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono font-semibold"
            />
            {numericAmount > 0 && (
              <p className="text-2xs text-slate-500 mt-1">Formatted: {formatKES(numericAmount)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Invoice / Reference Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Project / Department
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-lg border border-slate-300 bg-white"
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('M-Pesa')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                  paymentMethod === 'M-Pesa'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                M-Pesa
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Bank Transfer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Requested Payment Date
            </label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Reason / Purpose
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Supporting Notes
          </label>
          <textarea
            value={supportingNotes}
            onChange={(e) => setSupportingNotes(e.target.value)}
            rows={2}
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={() => navigateTo('payment-detail', request.id)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={isSaving}
              leftIcon={<Save size={15} />}
            >
              Save Changes
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSaving}
              leftIcon={<Send size={15} />}
            >
              Submit for Approval
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
