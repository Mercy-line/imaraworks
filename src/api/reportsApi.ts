import {
  FinancialMetrics,
  ProjectBreakdown,
  StatusBreakdown,
  MonthlyTrend,
  PaymentMethodBreakdown,
} from '../types';
import { mockDb } from './mockDb';
import { simulateDelay } from '../lib/utils';

export const reportsApi = {
  async getFinancialMetrics(): Promise<FinancialMetrics> {
    await simulateDelay(150);
    const requests = mockDb.getPaymentRequests();

    const paidRequests = requests.filter((r) => r.status === 'PAID');
    const pendingRequests = requests.filter((r) => r.status === 'PENDING_APPROVAL');
    const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
    const failedRequests = requests.filter((r) => r.status === 'FAILED');
    const draftRequests = requests.filter((r) => r.status === 'DRAFT');

    const total_paid_kes = paidRequests.reduce((sum, r) => sum + r.amount, 0);
    const pending_approvals_kes = pendingRequests.reduce((sum, r) => sum + r.amount, 0);
    const ready_for_processing_kes = approvedRequests.reduce((sum, r) => sum + r.amount, 0);
    const failed_payments_kes = failedRequests.reduce((sum, r) => sum + r.amount, 0);

    return {
      total_paid_kes,
      pending_approvals_count: pendingRequests.length,
      pending_approvals_kes,
      ready_for_processing_count: approvedRequests.length,
      ready_for_processing_kes,
      failed_payments_count: failedRequests.length,
      failed_payments_kes,
      total_requests_count: requests.length,
      draft_count: draftRequests.length,
      average_approval_hours: 4.2,
    };
  },

  async getProjectBreakdown(): Promise<ProjectBreakdown[]> {
    await simulateDelay(150);
    const requests = mockDb.getPaymentRequests();
    const map: Record<string, { total: number; count: number }> = {};

    let grandTotal = 0;
    for (const req of requests) {
      if (!map[req.project_department]) {
        map[req.project_department] = { total: 0, count: 0 };
      }
      map[req.project_department].total += req.amount;
      map[req.project_department].count += 1;
      grandTotal += req.amount;
    }

    return Object.entries(map).map(([project, data]) => ({
      project,
      total_amount: data.total,
      count: data.count,
      percentage: grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0,
    })).sort((a, b) => b.total_amount - a.total_amount);
  },

  async getStatusBreakdown(): Promise<StatusBreakdown[]> {
    await simulateDelay(150);
    const requests = mockDb.getPaymentRequests();
    const map: Record<string, { count: number; amount: number }> = {
      DRAFT: { count: 0, amount: 0 },
      SUBMITTED: { count: 0, amount: 0 },
      PENDING_APPROVAL: { count: 0, amount: 0 },
      APPROVED: { count: 0, amount: 0 },
      PROCESSING: { count: 0, amount: 0 },
      PAID: { count: 0, amount: 0 },
      REJECTED: { count: 0, amount: 0 },
      FAILED: { count: 0, amount: 0 },
    };

    for (const req of requests) {
      if (map[req.status]) {
        map[req.status].count += 1;
        map[req.status].amount += req.amount;
      }
    }

    return Object.entries(map).map(([status, data]) => ({
      status: status as any,
      count: data.count,
      amount: data.amount,
    }));
  },

  async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    await simulateDelay(150);
    return [
      { month: 'May 2026', paid_amount: 320000, submitted_amount: 410000, count: 8 },
      { month: 'Jun 2026', paid_amount: 450000, submitted_amount: 520000, count: 11 },
      { month: 'Jul 2026', paid_amount: 680000, submitted_amount: 790000, count: 14 },
      { month: 'Aug 2026', paid_amount: 890000, submitted_amount: 950000, count: 19 },
      { month: 'Sep 2026', paid_amount: 1215500, submitted_amount: 1485000, count: 24 },
    ];
  },

  async getPaymentMethodBreakdown(): Promise<PaymentMethodBreakdown[]> {
    await simulateDelay(150);
    const requests = mockDb.getPaymentRequests();
    let mpesaTotal = 0;
    let mpesaCount = 0;
    let bankTotal = 0;
    let bankCount = 0;

    for (const r of requests) {
      if (r.requested_payment_method === 'M-Pesa') {
        mpesaTotal += r.amount;
        mpesaCount += 1;
      } else {
        bankTotal += r.amount;
        bankCount += 1;
      }
    }

    return [
      { method: 'Bank Transfer', total_amount: bankTotal, count: bankCount },
      { method: 'M-Pesa', total_amount: mpesaTotal, count: mpesaCount },
    ];
  },
};
