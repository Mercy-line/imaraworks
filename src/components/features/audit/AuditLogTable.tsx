import React, { useEffect, useState } from 'react';
import { useNavigation } from '../../../contexts/NavigationContext';
import { AuditEvent } from '../../../types';
import { auditApi } from '../../../api/auditApi';
import { formatDateTime, formatTimeAgo } from '../../../lib/formatters';
import { exportToCsv } from '../../../lib/utils';
import { Button } from '../../common/Button';
import { LoadingState } from '../../common/LoadingState';
import {
  ScrollText,
  Search,
  Download,
  ShieldCheck,
  Filter,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';

export const AuditLogTable: React.FC = () => {
  const { navigateTo } = useNavigation();

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');

  useEffect(() => {
    async function loadAudit() {
      try {
        setIsLoading(true);
        const logs = await auditApi.getAuditEvents();
        setAuditEvents(logs);
      } catch (err) {
        console.error('Failed to load audit events:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAudit();
  }, []);

  const actors = Array.from(new Set(auditEvents.map((a) => a.actor_name)));

  const filteredEvents = auditEvents.filter((ev) => {
    if (actorFilter !== 'ALL' && ev.actor_name !== actorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        ev.action.toLowerCase().includes(q) ||
        ev.actor_name.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        (ev.request_code && ev.request_code.toLowerCase().includes(q)) ||
        ev.entity_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    const data = filteredEvents.map((ev) => ({
      Timestamp: ev.timestamp,
      Actor: ev.actor_name,
      Role: ev.actor_role,
      Action: ev.action,
      Entity: ev.entity_type,
      'Request Code': ev.request_code || ev.entity_id,
      Description: ev.description,
    }));
    exportToCsv(`ImaraPay_Security_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`, data);
  };

  if (isLoading) {
    return <LoadingState type="table-skeleton" rows={8} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Audit Log</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Immutable Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sequence-logged records of user authentication, approvals, rejections, and disbursements
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          leftIcon={<Download size={14} />}
        >
          Export Audit Trail
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, PR code, description..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">All Actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-2xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor & Role</th>
                <th className="py-3.5 px-4">Business Action</th>
                <th className="py-3.5 px-4">Entity / Target</th>
                <th className="py-3.5 px-4">Details & Reason</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono text-slate-800 font-medium">{formatDateTime(ev.timestamp)}</div>
                    <div className="text-[10px] text-slate-400">{formatTimeAgo(ev.timestamp)}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{ev.actor_name}</div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-slate-500">
                      <span>{ev.actor_role}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{ev.action}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-2xs">
                    {ev.request_code ? (
                      <button
                        type="button"
                        onClick={() => navigateTo('payment-detail', ev.request_code)}
                        className="text-slate-900 font-bold hover:underline"
                      >
                        {ev.request_code}
                      </button>
                    ) : (
                      <span className="text-slate-500">{ev.entity_type}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm text-xs leading-relaxed">
                    {ev.description}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {ev.request_code && (
                      <button
                        type="button"
                        onClick={() => navigateTo('payment-detail', ev.request_code)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                        title="View request"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
