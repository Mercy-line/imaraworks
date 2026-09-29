import { PaymentStatus, ApprovalThreshold } from '../types';

/**
 * Formats a number as Kenyan Shillings (KES)
 * Example: 24500 -> "KES 24,500"
 */
export function formatKES(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount)) return 'KES 0';
  const formatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  // Replace default KES code formatting if needed
  return formatter.format(amount).replace('Ksh', 'KES').replace('KES', 'KES ');
}

/**
 * Compact KES representation for dashboard cards
 * Example: 148000 -> "KES 148K", 1250000 -> "KES 1.25M"
 */
export function formatCompactKES(amount: number): string {
  if (isNaN(amount)) return 'KES 0';
  if (amount >= 1_000_000) {
    return `KES ${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `KES ${(amount / 1_000).toFixed(1)}K`;
  }
  return formatKES(amount);
}

/**
 * Formats ISO date string to human readable format
 * Example: "2026-09-28T08:15:00Z" -> "28 Sep 2026, 11:15"
 */
export function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats ISO date string to date only
 * Example: "2026-09-28T08:15:00Z" -> "28 Sep 2026"
 */
export function formatDateOnly(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Relative time helper (e.g., "10 mins ago", "Yesterday")
 */
export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return formatDateOnly(isoString);
  } catch {
    return isoString;
  }
}

/**
 * Returns formatted status label
 */
export function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'SUBMITTED':
      return 'Submitted';
    case 'PENDING_APPROVAL':
      return 'Pending Approval';
    case 'APPROVED':
      return 'Approved';
    case 'PROCESSING':
      return 'Processing';
    case 'PAID':
      return 'Paid';
    case 'REJECTED':
      return 'Rejected';
    case 'FAILED':
      return 'Failed';
    default:
      return status;
  }
}

/**
 * Explains the approval threshold requirements
 */
export function getThresholdDescription(amount: number): {
  threshold: ApprovalThreshold;
  label: string;
  badgeText: string;
  description: string;
} {
  if (amount > 50000) {
    return {
      threshold: 'MANAGER_AND_FINANCE',
      label: 'Manager + Finance Approval Required',
      badgeText: '> KES 50k (2 Steps)',
      description: 'Payments above KES 50,000 require approval from a manager and Finance.',
    };
  }
  return {
    threshold: 'SINGLE_MANAGER',
    label: 'Manager Approval Required',
    badgeText: '≤ KES 50k (1 Step)',
    description: 'Payments of KES 50,000 or less require approval from one manager.',
  };
}
