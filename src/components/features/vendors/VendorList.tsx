import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { Vendor, PaymentRequest } from '../../../types';
import { vendorsApi } from '../../../api/vendorsApi';
import { paymentsApi } from '../../../api/paymentsApi';
import { CurrencyDisplay } from '../../common/CurrencyDisplay';
import { StatusBadge } from '../../common/StatusBadge';
import { formatKES, formatDateTime, formatDateOnly } from '../../../lib/formatters';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';
import { LoadingState } from '../../common/LoadingState';
import {
  Building2,
  PlusCircle,
  Search,
  Phone,
  Mail,
  CreditCard,
  Receipt,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const VendorList: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useNotifications();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Vendor Drawer / Modal
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Add Vendor Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newServiceType, setNewServiceType] = useState('Construction materials');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newMpesa, setNewMpesa] = useState('');
  const [isSavingVendor, setIsSavingVendor] = useState(false);

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      const [vList, rList] = await Promise.all([
        vendorsApi.getVendors(),
        paymentsApi.getPaymentRequests(),
      ]);
      setVendors(vList);
      setRequests(rList);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newVendorName.trim()) return;

    setIsSavingVendor(true);
    try {
      const created = await vendorsApi.createVendor(
        {
          name: newVendorName.trim(),
          service_type: newServiceType,
          contact_person: newContactPerson.trim() || 'Accounts Contact',
          email: newEmail.trim() || 'billing@vendor.co.ke',
          phone: newPhone.trim() || '+254 700 000 000',
          bank_name: newBankName.trim() || 'Equity Bank',
          bank_account_no: newBankAccount.trim() || '0180299381920',
          mpesa_paybill_or_till: newMpesa.trim() || '247247',
          status: 'ACTIVE',
        },
        currentUser
      );

      showToast('success', 'Vendor Created', `Registered ${created.name} into master catalog.`);
      setIsAddModalOpen(false);
      setNewVendorName('');
      setNewContactPerson('');
      setNewEmail('');
      setNewPhone('');
      await loadVendors();
    } catch (err: any) {
      showToast('error', 'Creation Failed', err.message);
    } finally {
      setIsSavingVendor(false);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact_person.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const vendorRequests = selectedVendor
    ? requests.filter((r) => r.vendor_id === selectedVendor.id)
    : [];

  if (isLoading) {
    return <LoadingState type="table-skeleton" rows={6} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Vendor Master Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered contractors, suppliers, material providers, and banking payment profiles
          </p>
        </div>

        {(currentUser?.role === 'FINANCE' || currentUser?.role === 'ADMIN') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<PlusCircle size={15} />}
          >
            Add New Vendor
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor by company name, service, or contact..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredVendors.length} Verified Vendors
        </span>
      </div>

      {/* Vendors Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-2xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3.5 px-4">Vendor Company</th>
                <th className="py-3.5 px-4">Service Category</th>
                <th className="py-3.5 px-4">Disbursement Channels</th>
                <th className="py-3.5 px-4">Payment Requests</th>
                <th className="py-3.5 px-4">Total Paid (KES)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{vendor.name}</div>
                    <div className="text-2xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{vendor.contact_person}</span>
                      <span>•</span>
                      <span>{vendor.phone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {vendor.service_type}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-2xs font-mono text-slate-600 space-y-0.5">
                      {vendor.mpesa_paybill_or_till && (
                        <div>Paybill: {vendor.mpesa_paybill_or_till}</div>
                      )}
                      {vendor.bank_name && (
                        <div className="text-slate-500">
                          {vendor.bank_name} ({vendor.bank_account_no || 'Acc on file'})
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {vendor.payment_requests_count} claims
                  </td>
                  <td className="py-3.5 px-4">
                    <CurrencyDisplay amount={vendor.total_paid} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full border ${
                        vendor.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{vendor.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVendor(vendor);
                      }}
                      className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-700 bg-slate-100 group-hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                    >
                      <Eye size={12} />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Profile & History Modal / Drawer */}
      <Modal
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={selectedVendor?.name}
        subtitle={`${selectedVendor?.service_type} • Verified Partner`}
        maxWidth="2xl"
      >
        {selectedVendor && (
          <div className="space-y-6">
            {/* KPI overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-2xs block">Total Paid Out</span>
                <CurrencyDisplay amount={selectedVendor.total_paid} size="lg" />
              </div>
              <div>
                <span className="text-slate-400 text-2xs block">Total Payment Requests</span>
                <span className="font-bold text-slate-900 text-base font-mono">
                  {vendorRequests.length || selectedVendor.payment_requests_count}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-2xs block">Account Status</span>
                <span className="font-bold text-emerald-700 text-xs">Active Registered</span>
              </div>
            </div>

            {/* Contact & Banking Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Disbursement & Banking Coordinates
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-2xs block">Bank Account Details</span>
                  <div className="font-semibold text-slate-900">{selectedVendor.bank_name || 'N/A'}</div>
                  <div className="font-mono text-slate-600">Acc: {selectedVendor.bank_account_no || 'N/A'}</div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-2xs block">M-Pesa Corporate Channel</span>
                  <div className="font-semibold text-emerald-800">
                    {selectedVendor.mpesa_paybill_or_till || 'N/A'}
                  </div>
                  <div className="text-slate-500 text-2xs">B2B Float Verified</div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-2xs block">Contact Person</span>
                  <div className="font-semibold text-slate-900">{selectedVendor.contact_person}</div>
                  <div className="text-slate-500">{selectedVendor.phone}</div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-2xs block">Email Address</span>
                  <div className="font-semibold text-slate-900">{selectedVendor.email}</div>
                  <div className="text-slate-500 text-2xs">Automated Remittance Alerts</div>
                </div>
              </div>
            </div>

            {/* Payment History for this Vendor */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Payment Request History ({vendorRequests.length})
              </h4>

              {vendorRequests.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
                  No historical payment requests for this vendor.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
                  {vendorRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setSelectedVendor(null);
                        navigateTo('payment-detail', req.id);
                      }}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900">{req.id}</div>
                        <div className="text-2xs text-slate-500 truncate max-w-[200px]">
                          {req.reason}
                        </div>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay amount={req.amount} size="sm" />
                        <div className="mt-0.5">
                          <StatusBadge status={req.status} size="sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedVendor(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Vendor / Contractor"
        subtitle="Add a contractor to the master payment catalog"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Vendor Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                required
                placeholder="e.g. Kenya Steel Mills Ltd."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Service / Supply Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Construction materials">Construction materials</option>
                <option value="Cement">Cement</option>
                <option value="Transport">Transport & Logistics</option>
                <option value="Equipment rental">Equipment rental</option>
                <option value="Electrical materials">Electrical materials</option>
                <option value="Plumbing services">Plumbing services</option>
                <option value="Structural steel">Structural steel</option>
                <option value="Consulting & Engineering">Consulting & Engineering</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={newContactPerson}
                onChange={(e) => setNewContactPerson(e.target.value)}
                placeholder="e.g. Patrick Maina"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+254 722 000 111"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="accounts@contractor.co.ke"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                M-Pesa Paybill / Till Number
              </label>
              <input
                type="text"
                value={newMpesa}
                onChange={(e) => setNewMpesa(e.target.value)}
                placeholder="247247 (Acc: VENDOR)"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder="e.g. Equity Bank / KCB"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={newBankAccount}
                onChange={(e) => setNewBankAccount(e.target.value)}
                placeholder="e.g. 0180299381920"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSavingVendor}>
              Save Vendor Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
