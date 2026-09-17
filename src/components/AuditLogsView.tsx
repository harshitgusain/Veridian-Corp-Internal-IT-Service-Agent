import React, { useState } from 'react';
import { History, Search, Shield, Clock, FileText, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { AuditLogEntry } from '../types.ts';
import { useTimezone } from '../lib/TimezoneContext.tsx';

interface AuditLogsViewProps {
  auditLogs: AuditLogEntry[];
  onResetSession: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs, onResetSession }) => {
  const { formatTime } = useTimezone();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = auditLogs.filter((entry) => {
    const term = searchTerm.toLowerCase();
    return (
      entry.requestId.toLowerCase().includes(term) ||
      entry.action.toLowerCase().includes(term) ||
      entry.result.toLowerCase().includes(term) ||
      entry.source.toLowerCase().includes(term) ||
      (entry.evidence && entry.evidence.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Agent Activity & Decision Audit Trail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white">
                {auditLogs.length} Events Logged
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Transparent, non-hidden decision evidence log for each processed IT request. No private chain-of-thought is exposed; only verifiable policy citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter audit events..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={onResetSession}
              title="Reset session audit logs"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Source / Policy</th>
                <th className="py-3 px-6">Evidence / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td
                      className="py-3 px-4 font-mono text-2xs text-slate-500 whitespace-nowrap"
                      title={formatTime(entry.timestamp, 'full')}
                    >
                      {formatTime(entry.timestamp, 'time-only')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
                      {entry.requestId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {entry.action}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        entry.result === 'RESOLVE' || entry.result === 'Success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : entry.result === 'FOLLOW_UP' || entry.result.includes('Follow-up')
                          ? 'bg-amber-50 text-amber-700'
                          : entry.result === 'ESCALATE' || entry.result.includes('Escalat')
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {entry.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {entry.source}
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-600 max-w-md truncate">
                      {entry.evidence || entry.details || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    No audit records match the current filter. Process a request in "New Request" or "Demo Mode" to generate live events.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Audit Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-200 text-slate-800">
                  {selectedEntry.requestId}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  Audit Event Details
                </h3>
              </div>
              <span className="font-mono text-2xs text-slate-500 font-medium">
                {formatTime(selectedEntry.timestamp, 'full')}
              </span>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold block text-2xs">Action</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedEntry.action}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold block text-2xs">Result</span>
                <p className="font-bold text-blue-700 mt-0.5">{selectedEntry.result}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold block text-2xs">Source</span>
                <p className="font-mono text-slate-800 mt-0.5">{selectedEntry.source}</p>
              </div>

              {selectedEntry.evidence && (
                <div>
                  <span className="text-slate-400 uppercase font-semibold block text-2xs">Grounded Evidence</span>
                  <div className="mt-1 p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 italic">
                    "{selectedEntry.evidence}"
                  </div>
                </div>
              )}

              {selectedEntry.details && (
                <div>
                  <span className="text-slate-400 uppercase font-semibold block text-2xs">Telemetry Details</span>
                  <p className="text-slate-600 mt-0.5">{selectedEntry.details}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
