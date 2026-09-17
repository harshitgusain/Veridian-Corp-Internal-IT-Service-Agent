import React, { useState } from 'react';
import { Ticket, Search, CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, ChevronRight, Filter } from 'lucide-react';
import { HistoricalTicketItem, StructuredTicket } from '../types.ts';
import { useTimezone } from '../lib/TimezoneContext.tsx';

interface TicketQueueViewProps {
  historicalTickets: HistoricalTicketItem[];
  generatedTickets: StructuredTicket[];
}

export const TicketQueueView: React.FC<TicketQueueViewProps> = ({
  historicalTickets,
  generatedTickets,
}) => {
  const { formatTime } = useTimezone();
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'session'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<{
    id: string;
    employee: string;
    summary: string;
    status: string;
    isActive: boolean;
    policy?: string;
    resolution?: string;
    isSessionGenerated?: boolean;
    fullSessionTicket?: StructuredTicket;
  } | null>(null);

  // Normalize historical tickets
  const normalizedHistorical = historicalTickets.map((t) => ({
    id: t.ticketId,
    employee: t.employee,
    summary: t.issueSummary,
    status: t.status,
    isActive: t.isActive,
    policy: t.relatedPolicyId,
    resolution: t.resolutionNotes,
    isSessionGenerated: false,
  }));

  // Normalize session generated tickets
  const normalizedSession = generatedTickets.map((t) => ({
    id: t.ticketId,
    employee: t.employee,
    summary: t.issueSummary,
    status: t.status,
    isActive: t.decision !== 'RESOLVE',
    policy: t.policyId,
    resolution: t.requiredAction,
    isSessionGenerated: true,
    fullSessionTicket: t,
  }));

  const allTickets = [...normalizedSession, ...normalizedHistorical];

  const filteredTickets = allTickets.filter((t) => {
    // Filter type
    if (filter === 'active' && !t.isActive) return false;
    if (filter === 'closed' && t.isActive) return false;
    if (filter === 'session' && !t.isSessionGenerated) return false;

    // Search term
    const term = searchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(term) ||
      t.employee.toLowerCase().includes(term) ||
      t.summary.toLowerCase().includes(term) ||
      t.status.toLowerCase().includes(term)
    );
  });

  const activeCount = allTickets.filter((t) => t.isActive).length;
  const closedCount = allTickets.filter((t) => !t.isActive).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                IT Ticket Queue & Precedent Records
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white">
                {allTickets.length} Total Records
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Data Pack Section 3: Tickets marked Resolved, Rejected, or Approved (closed) serve as historical context and precedent. Active tickets are open cases.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets by ID, employee..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Tickets ({allTickets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Active Open Cases ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('closed')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'closed'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Closed Precedent Records ({closedCount})</span>
          </button>
          {generatedTickets.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter('session')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'session'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span>Session Generated ({generatedTickets.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-6">Issue Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Related Policy</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-xs">
                    <span className={ticket.isSessionGenerated ? 'text-blue-600' : 'text-slate-900'}>
                      {ticket.id}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {ticket.isSessionGenerated ? (
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Live Agent
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Data Pack
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {ticket.employee}
                  </td>
                  <td className="py-3 px-6 text-slate-800 font-medium">
                    {ticket.summary}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      ticket.isActive
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : ticket.status.includes('Rejected')
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {ticket.isActive ? (
                        <Clock className="h-3 w-3" />
                      ) : ticket.status.includes('Rejected') ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      <span>{ticket.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                    {ticket.policy || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 group-hover:text-slate-700 whitespace-nowrap">
                    <ChevronRight className="h-4 w-4 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-slate-900 text-white">
                  {selectedTicket.id}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedTicket.isSessionGenerated ? 'Live Generated Ticket' : 'Historical Ticket Record'}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                selectedTicket.isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {selectedTicket.status}
              </span>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employee
                </span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedTicket.employee}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Issue Summary
                </span>
                <p className="text-slate-800 font-medium mt-0.5">{selectedTicket.summary}</p>
              </div>

              {selectedTicket.policy && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Associated Policy Reference
                  </span>
                  <p className="text-xs font-mono text-blue-700 mt-0.5">{selectedTicket.policy}</p>
                </div>
              )}

              {selectedTicket.resolution && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Resolution / Handling Notes
                  </span>
                  <div className="mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {selectedTicket.resolution}
                  </div>
                </div>
              )}

              {selectedTicket.fullSessionTicket && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Assigned Team:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedTicket.fullSessionTicket.assignedTeam}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Priority:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedTicket.fullSessionTicket.priority}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="font-mono text-slate-700">
                      {formatTime(selectedTicket.fullSessionTicket.createdTimestamp, 'full')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                Close Ticket Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
