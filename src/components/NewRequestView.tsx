import React, { useState } from 'react';
import {
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  HelpCircle,
  Clock,
  BookOpen,
  FileCheck,
  Building,
  User,
  Mail,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AnalysisResponse, EmployeeRequestItem, PolicyRule } from '../types.ts';
import { useTimezone } from '../lib/TimezoneContext.tsx';

interface NewRequestViewProps {
  onAnalyze: (input: string, name?: string, email?: string, reqId?: string) => Promise<AnalysisResponse | null>;
  policies: PolicyRule[];
  sampleRequests: EmployeeRequestItem[];
  currentResult: AnalysisResponse | null;
  isLoading: boolean;
  onOpenPolicy: (policy: PolicyRule) => void;
  onClear: () => void;
}

export const NewRequestView: React.FC<NewRequestViewProps> = ({
  onAnalyze,
  policies,
  sampleRequests,
  currentResult,
  isLoading,
  onOpenPolicy,
  onClear,
}) => {
  const { formatTime } = useTimezone();
  const [inputText, setInputText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRequestItem | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Quick sample prompts strictly grounded in the Data Pack
  const samplePills = [
    {
      label: 'Dead Laptop (3.5 yrs)',
      text: 'My laptop won’t turn on at all, it’s completely dead, had it about 3.5 years now.',
      employee: sampleRequests.find((r) => r.id === 'REQ-01'),
    },
    {
      label: 'Flickering Screen (2 yrs)',
      text: 'Laptop screen is flickering on and off, had it 2 years, might just need a fix not a replacement.',
      employee: sampleRequests.find((r) => r.id === 'REQ-13'),
    },
    {
      label: 'Browser Extension Approval',
      text: 'Requesting approval to install a browser extension for productivity tracking.',
      employee: sampleRequests.find((r) => r.id === 'REQ-14'),
    },
    {
      label: 'Password Lockout (>5 attempts)',
      text: "I'm locked out of my account, tried my password 6 times.",
      employee: sampleRequests.find((r) => r.id === 'REQ-03'),
    },
    {
      label: 'Guest Wi-Fi (24h pass)',
      text: 'Can I get Wi-Fi access for a guest visiting our office tomorrow?',
      employee: sampleRequests.find((r) => r.id === 'REQ-02'),
    },
    {
      label: 'VPN Credential Expired (90 days)',
      text: 'My VPN stopped working this morning, says credentials expired.',
      employee: sampleRequests.find((r) => r.id === 'REQ-05'),
    },
    {
      label: 'Non-Catalog Software Approval',
      text: "Need approval to install a data-analysis tool that's not in the software catalog.",
      employee: sampleRequests.find((r) => r.id === 'REQ-04'),
    },
    {
      label: 'Phishing Email Report',
      text: 'I think I got a phishing email asking for my login — forwarding it to a few teammates to check.',
      employee: sampleRequests.find((r) => r.id === 'REQ-08'),
    },
    {
      label: 'Mailbox Full (Quota 25GB)',
      text: 'My mailbox is full and I can’t send emails.',
      employee: sampleRequests.find((r) => r.id === 'REQ-09'),
    },
    {
      label: 'Admin Access Request',
      text: 'Can someone give me admin access to the finance reporting server? Need it urgently for month-end.',
      employee: sampleRequests.find((r) => r.id === 'REQ-10'),
    },
    {
      label: 'Contractor VPN Access',
      text: 'New contractor joining my team next week, they’ll need VPN access.',
      employee: sampleRequests.find((r) => r.id === 'REQ-11'),
    },
    {
      label: 'Expense Tool Credentials',
      text: 'I can’t log into the expense tool, keeps saying invalid credentials.',
      employee: sampleRequests.find((r) => r.id === 'REQ-12'),
    },
    {
      label: 'WFH Monitor Allowance',
      text: 'I’ve started working from home 4 days a week, how do I get a monitor?',
      employee: sampleRequests.find((r) => r.id === 'REQ-07'),
    },
    {
      label: 'Printer Spooler / Paper Jam',
      text: 'Printer on the 3rd floor keeps showing “paper jam” even though there’s no jam.',
      employee: sampleRequests.find((r) => r.id === 'REQ-06'),
    },
    {
      label: 'Vague Request ("not working")',
      text: 'hey can you help, its not working',
      employee: sampleRequests.find((r) => r.id === 'REQ-15'),
    },
  ];

  const handleSelectSamplePill = (pill: typeof samplePills[0]) => {
    setInputText(pill.text);
    if (pill.employee) {
      setSelectedEmployee(pill.employee);
      setCustomName(pill.employee.employee);
      setCustomEmail(pill.employee.email);
    }
  };

  const handleRandomSample = () => {
    if (sampleRequests.length === 0) return;
    const randomIndex = Math.floor(Math.random() * sampleRequests.length);
    const sample = sampleRequests[randomIndex];
    setSelectedEmployee(sample);
    setInputText(sample.request);
    setCustomName(sample.employee);
    setCustomEmail(sample.email);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const name = selectedEmployee ? selectedEmployee.employee : (customName.trim() || 'Veridian Employee');
    const email = selectedEmployee ? selectedEmployee.email : (customEmail.trim() || 'employee@veridian-corp.example');
    const reqId = selectedEmployee?.id;

    await onAnalyze(inputText, name, email, reqId);
  };

  const handleFollowUpOption = (option: string) => {
    const refinedText = `${inputText} (Employee clarified: ${option})`;
    setInputText(refinedText);
    const name = selectedEmployee ? selectedEmployee.employee : (customName.trim() || 'Veridian Employee');
    const email = selectedEmployee ? selectedEmployee.email : (customEmail.trim() || 'employee@veridian-corp.example');
    onAnalyze(refinedText, name, email, selectedEmployee?.id);
  };

  const handleCopyTicket = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(JSON.stringify(currentResult.structuredTicket, null, 2));
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  // Helper for decision styling
  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'RESOLVE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          desc: 'Direct Resolution Authorized by Policy',
        };
      case 'FOLLOW_UP':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: HelpCircle,
          desc: 'Additional Information Required',
        };
      case 'ESCALATE':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: AlertTriangle,
          desc: 'Escalated to Human Specialized Team',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-800 border-slate-300',
          icon: AlertTriangle,
          desc: 'Review',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Input Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Internal IT Support Agent
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Submit an employee IT issue. The agent classifies, retrieves policies from the Data Pack, checks ticket history, and makes an auditable decision.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Load Sample Request
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setSelectedEmployee(null);
                setCustomName('');
                setCustomEmail('');
                onClear();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Employee context selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Employee Identity (From Data Pack or Custom)
              </label>
              <select
                value={selectedEmployee ? selectedEmployee.id : 'custom'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setSelectedEmployee(null);
                  } else {
                    const match = sampleRequests.find((r) => r.id === val);
                    if (match) {
                      setSelectedEmployee(match);
                      setCustomName(match.employee);
                      setCustomEmail(match.email);
                    }
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="custom">Manual / Free-text Employee</option>
                <optgroup label="Data Pack Requests (REQ-01 to REQ-15)">
                  {sampleRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id}: {r.employee} ({r.email})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                Contact Email
              </label>
              <input
                type="email"
                value={selectedEmployee ? selectedEmployee.email : customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="employee@veridian-corp.example"
                disabled={Boolean(selectedEmployee)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 disabled:text-slate-500 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Large request input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Describe your IT issue...
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. My laptop won’t turn on at all, it’s completely dead, had it about 3.5 years now."
              className="w-full px-3.5 py-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span>Grounded in Knowledge Base (KB-01 - KB-10 & Asset Management)</span>
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm transition-colors shadow-sm disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing with Agent Engine...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Analyze Request</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick test pills */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
            Quick Prompts from Data Pack Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSamplePill(pill)}
                className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULT SECTION: All 8 Required Result Cards */}
      {currentResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Engine Banner */}
          <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-800 text-white text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Engine Execution:</span>
              <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-blue-300">
                {currentResult.engineUsed}
              </span>
            </div>
            <span className="text-slate-400">Response ID: {currentResult.structuredTicket.ticketId}</span>
          </div>

          {/* Cards 1 & 2: Issue Classification & Decision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Issue Classification */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  1. Issue Classification
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {currentResult.issueSummary}
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Category: {currentResult.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    currentResult.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : currentResult.priority === 'High'
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : currentResult.priority === 'Medium'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    Priority: {currentResult.priority}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                Classified based on explicit policy boundaries and intent matching.
              </p>
            </div>

            {/* Card 2: Decision */}
            {(() => {
              const badge = getDecisionBadge(currentResult.decision);
              const Icon = badge.icon;
              return (
                <div className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between ${badge.bg}`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                      2. Agent Decision
                    </span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="h-10 w-10 rounded-lg bg-white/80 flex items-center justify-center shadow-xs">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight">
                          {currentResult.decision}
                        </h2>
                        <p className="text-xs font-medium opacity-90 mt-0.5">
                          {badge.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-current/15 text-xs font-mono">
                    Status: <span className="font-bold">{currentResult.structuredTicket.status}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card: Follow-up Interactive Box (Only when FOLLOW_UP) */}
          {currentResult.followUp && currentResult.followUp.needed && (
            <div className="bg-amber-50/90 rounded-xl border border-amber-300 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Follow-up Question Required
                    </span>
                    <p className="text-sm font-semibold text-amber-950 mt-1">
                      {currentResult.followUp.question}
                    </p>
                    {currentResult.followUp.context && (
                      <p className="text-xs text-amber-800 mt-0.5">
                        {currentResult.followUp.context}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-medium text-amber-900 block mb-1.5">
                      Select clarification to resume processing:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.followUp.options.map((option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleFollowUpOption(option)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 hover:border-amber-400 transition-colors shadow-2xs"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cards 3 & 4: Recommended Action & Assigned Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 3: Recommended Action */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                3. Recommended Action
              </span>
              <p className="text-sm text-slate-800 font-medium mt-2 leading-relaxed">
                {currentResult.recommendedAction}
              </p>
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold block mb-1 text-slate-900">Agent Response to Employee:</span>
                "{currentResult.agentResponse}"
              </div>
            </div>

            {/* Card 4: Assigned Team */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  4. Assigned Team
                </span>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {currentResult.assignedTeam}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Designated organizational handling group
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Routing based on Veridian Corp operating model</span>
                <span className="font-semibold text-slate-700">SLA: Standard</span>
              </div>
            </div>
          </div>

          {/* Cards 5 & 6: Policy Source & Existing Ticket Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 5: Policy Source & Evidence */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  5. Policy Source & Evidence
                </span>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <FileCheck className="h-3.5 w-3.5" />
                  Grounded Citation
                </span>
              </div>

              {currentResult.policySources.length > 0 ? (
                currentResult.policySources.map((source) => {
                  const fullPolicy = policies.find((p) => p.id === source.id);
                  return (
                    <div
                      key={source.id}
                      className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 font-mono">
                          Source: {source.id} — {source.title}
                        </span>
                        {fullPolicy && (
                          <button
                            type="button"
                            onClick={() => onOpenPolicy(fullPolicy)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <span>Open Policy</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 font-sans italic border-l-2 border-blue-400 pl-2.5">
                        "{source.evidence}"
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  No standard KB policy directly authorizes this request. Escalated conservatively to Tier 2 support.
                </div>
              )}
            </div>

            {/* Card 6: Existing Ticket Context */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                6. Existing Ticket Precedent & Context
              </span>

              {currentResult.matchedHistoricalTickets.length > 0 ? (
                currentResult.matchedHistoricalTickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">
                        {ticket.ticketId}: {ticket.employee}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${
                        ticket.isActive
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      Issue: {ticket.issueSummary}
                    </p>
                    <p className="text-slate-500 text-2xs">
                      Precedent Resolution: {ticket.resolutionNotes}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  No direct ticket precedent in historical queue. Processed based strictly on policy criteria.
                </div>
              )}
            </div>
          </div>

          {/* Card 7: Structured Ticket (Persistent) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  7. Structured IT Support Ticket
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-900 text-white">
                  {currentResult.structuredTicket.ticketId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyTicket}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                {copiedTicket ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied JSON</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-mono text-2xs uppercase">Employee</span>
                <span className="font-semibold text-slate-800">{currentResult.structuredTicket.employee}</span>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-mono text-2xs uppercase">Employee Email</span>
                <span className="font-semibold text-slate-800 truncate block">{currentResult.structuredTicket.employeeEmail}</span>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-mono text-2xs uppercase">Category</span>
                <span className="font-semibold text-slate-800">{currentResult.structuredTicket.category}</span>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-mono text-2xs uppercase">Created At</span>
                <span className="font-semibold text-slate-800 text-xs font-mono block">
                  {formatTime(currentResult.structuredTicket.createdTimestamp, 'compact')}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Original Request:</span>
                <span className="text-slate-400 font-mono">Assigned: {currentResult.structuredTicket.assignedTeam}</span>
              </div>
              <p className="text-slate-800 italic">"{currentResult.structuredTicket.originalRequest}"</p>
            </div>
          </div>

          {/* Card 8: Audit Trail */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                8. Decision Audit Trail (Non-Hidden Grounded Evidence)
              </span>
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {currentResult.auditTrail.length} Audited Milestones
              </span>
            </div>

            <div className="space-y-2">
              {currentResult.auditTrail.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <span
                    className="font-mono text-2xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0 mt-0.5 whitespace-nowrap"
                    title={formatTime(step.timestamp, 'full')}
                  >
                    {formatTime(step.timestamp, 'time-only')}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{step.action}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                      <span className="text-blue-700 font-medium">{step.result}</span>
                    </div>
                    {step.evidence && (
                      <p className="text-slate-600 font-mono text-2xs">
                        Evidence: {step.evidence}
                      </p>
                    )}
                    {step.details && (
                      <p className="text-slate-500 text-2xs">{step.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
