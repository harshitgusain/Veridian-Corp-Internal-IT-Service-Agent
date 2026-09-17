import React, { useState } from 'react';
import { Search, ArrowRight, Play, CheckCircle2, Clock, AlertCircle, Eye } from 'lucide-react';
import { EmployeeRequestItem } from '../types.ts';

interface EmployeeRequestsViewProps {
  requests: EmployeeRequestItem[];
  onProcessRequest: (request: EmployeeRequestItem) => void;
}

export const EmployeeRequestsView: React.FC<EmployeeRequestsViewProps> = ({
  requests,
  onProcessRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequestItem | null>(null);

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(term) ||
      r.employee.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.request.toLowerCase().includes(term) ||
      r.initialAction.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Data Pack Employee Requests
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                15 Requests (REQ-01 to REQ-15)
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Veridian Corp employee inquiries logged for the week of Mon 21 Sep – Fri 25 Sep 2026. Select any request to review details or process with the service engine.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search request, employee..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6">Issue / Request</th>
                <th className="py-3 px-4">Current Action So Far</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{req.employee}</div>
                    <div className="text-2xs text-slate-400 font-mono">{req.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                    {req.dateOpened}
                  </td>
                  <td className="py-3.5 px-6 text-slate-800 font-medium max-w-md">
                    <p className="line-clamp-2 leading-snug">"{req.request}"</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      req.initialAction.includes('Not started')
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : req.initialAction.includes('Escalated')
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : req.initialAction.includes('Waiting') || req.initialAction.includes('In progress')
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {req.initialAction}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProcessRequest(req);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Process with Agent</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  {selectedRequest.id}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  Request Details
                </h3>
              </div>
              <span className="text-xs text-slate-500">{selectedRequest.dateOpened}</span>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employee
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedRequest.employee} ({selectedRequest.email})
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Exact Submitted Text
                </span>
                <div className="mt-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 italic">
                  "{selectedRequest.request}"
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Initial Action Logged in Data Pack
                </span>
                <p className="text-slate-800 font-medium mt-1">
                  {selectedRequest.initialAction}
                </p>
              </div>

              {selectedRequest.notes && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Policy Grounding Notes
                  </span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const r = selectedRequest;
                  setSelectedRequest(null);
                  onProcessRequest(r);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Process with Agent</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
