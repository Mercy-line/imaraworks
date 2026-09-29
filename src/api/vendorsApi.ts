import { Vendor, UserAccount } from '../types';
import { mockDb } from './mockDb';
import { simulateDelay } from '../lib/utils';
import { AppApiError } from './client';

export const vendorsApi = {
  async getVendors(): Promise<Vendor[]> {
    await simulateDelay(150);
    return mockDb.getVendors();
  },

  async getVendor(id: string): Promise<Vendor> {
    await simulateDelay(150);
    const vendor = mockDb.getVendorById(id);
    if (!vendor) throw new AppApiError(404, `Vendor ${id} not found.`);
    return vendor;
  },

  async createVendor(
    data: Omit<Vendor, 'id' | 'created_at' | 'total_paid' | 'payment_requests_count'>,
    currentUser: UserAccount
  ): Promise<Vendor> {
    await simulateDelay(300);
    if (!data.name.trim()) throw new AppApiError(400, 'Vendor company name is required.');

    const newVendor = mockDb.createVendor(data);

    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Created Vendor Record',
      entity_type: 'Vendor',
      entity_id: newVendor.id,
      description: `${currentUser.name} registered vendor "${newVendor.name}" (${newVendor.service_type})`,
    });

    return newVendor;
  },

  async updateVendor(
    vendor: Vendor,
    currentUser: UserAccount
  ): Promise<Vendor> {
    await simulateDelay(250);
    const updated = mockDb.updateVendor(vendor);

    mockDb.recordAuditEvent({
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'Updated Vendor Record',
      entity_type: 'Vendor',
      entity_id: vendor.id,
      description: `${currentUser.name} updated vendor profile for "${vendor.name}".`,
    });

    return updated;
  },
};
