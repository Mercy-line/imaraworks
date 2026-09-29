import { AuditEvent } from '../types';
import { mockDb } from './mockDb';
import { simulateDelay } from '../lib/utils';

export const auditApi = {
  async getAuditEvents(requestId?: string): Promise<AuditEvent[]> {
    await simulateDelay(150);
    return mockDb.getAuditEvents(requestId);
  },
};
