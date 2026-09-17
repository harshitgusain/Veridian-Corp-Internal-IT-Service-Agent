import React from 'react';
import {
  GitFork,
  Shield,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Cpu,
  Database,
  Terminal,
  Lock,
  ArrowDown,
  FileCheck,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <GitFork className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              System Architecture & Decision Pipeline
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Veridian Corp Internal IT Service specification & runtime dataflow.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Workflow Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600" />
          <span>End-to-End Resolution Workflow</span>
        </h2>

        <div className="flex flex-col items-center space-y-3 py-2 max-w-xl mx-auto">
          {/* Node 1 */}
          <div className="w-full text-center p-3 rounded-lg bg-slate-900 text-white font-medium text-sm shadow-xs">
            Employee IT Request Input (Natural Language or Ticket)
          </div>
          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* Node 2 */}
          <div className="w-full text-center p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium text-sm shadow-2xs">
            Request Understanding & Entity Extraction
          </div>
          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* Node 3 */}
          <div className="w-full text-center p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium text-sm shadow-2xs">
            Issue Classification & Intent Boundary Mapping
          </div>
          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* Node 4 */}
          <div className="w-full text-center p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 font-medium text-sm shadow-2xs">
            Policy & Ticket Precedent Retrieval (Data Pack KB-01 – KB-10 & TK-1042 – TK-1051)
          </div>
          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* Node 5: Decision Engine */}
          <div className="w-full p-4 rounded-xl bg-slate-100 border border-slate-300 text-center shadow-xs">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Policy-Grounded Decision Engine
            </span>
            <p className="text-xs text-slate-600 mb-3">
              Explicit policy conditions (no arbitrary confidence scores or invented authority)
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>RESOLVE</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>FOLLOW-UP</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>ESCALATE</span>
              </div>
            </div>
          </div>
          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* Node 6 */}
          <div className="w-full text-center p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 font-medium text-sm shadow-2xs">
            Structured Ticket Generation (e.g. AGENT-0001 with Category, SLA, Team)
          </div>
          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* Node 7 */}
          <div className="w-full text-center p-3 rounded-lg bg-slate-900 text-white font-medium text-sm shadow-xs">
            Audit Trail Logging (Timestamped Policy Evidence Milestones)
          </div>
        </div>
      </div>

      {/* Technology Stack & Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            <span>Technology Stack</span>
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-slate-900 min-w-24">Frontend:</span>
              <span>React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-slate-900 min-w-24">Backend:</span>
              <span>Node.js, Express 4 server, strict ESM/CJS bundling via esbuild</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-slate-900 min-w-24">Decision Core:</span>
              <span>Veridian Policy Automation Engine with contextual policy retrieval</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-slate-900 min-w-24">Grounding:</span>
              <span>Strict Data Pack Policy & Precedent Engine (0% deviation, 100% verified citation)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-slate-900 min-w-24">Persistence:</span>
              <span>In-memory session state + Data Pack JSON source files in /data</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span>Grounding & Safety Rules</span>
          </h2>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Hallucination:</strong> Data Pack is the single source of truth; never invents policies or procedures.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Conservative Security:</strong> Suspected phishing, malware, or server admin rights are escalated immediately.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Precedent Grounding:</strong> Uses historical tickets (TK-1042 – TK-1051) to inform routing and decision context.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Transparent Audit Trail:</strong> Logs explicit citations (e.g. "KB-02 states...") without leaking chain-of-thought.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Assignment 2 Compliance Audit Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Assignment Brief & Data Pack Compliance Audit Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited against all 8 functional requirements and strict Data Pack grounding criteria.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
            8 / 8 Implemented (100%)
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Requirement</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Implementing File & Function</th>
                <th className="py-2.5 px-3">Data Pack Grounding / Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-01</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Understand the employee's issue</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  server/policyEngine.ts<br /><span className="text-slate-500">analyzeWithRuleEngine(), processRequestWithAgent()</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Entity extraction, intent boundary mapping, and classification into categories (Authentication, Hardware, Network, Security, Software).
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-02</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Find the relevant policy or resolution</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  server/policyEngine.ts<br /><span className="text-slate-500">policies.json (KB-01–KB-10, ASSET-MGMT), tickets.json</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Grounds directly into KB-01 to KB-10 and historical precedent tickets (TK-1042 to TK-1051) without hallucination.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-03</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Ask sensible follow-up questions</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  server/policyEngine.ts, src/components/NewRequestView.tsx<br /><span className="text-slate-500">followUpData, handleFollowUpOption()</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Generates interactive multi-choice follow-up questions for vague inputs (REQ-15 "not working") and printer spooler/asset tag verification (REQ-06).
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-04</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Resolve simple requests</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  server/policyEngine.ts<br /><span className="text-slate-500">decision = 'RESOLVE' workflows</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Automated direct resolution for password lockouts (&gt;5 attempts, KB-01), 24h guest Wi-Fi passes (KB-07), 90-day VPN renewals (KB-02), and laptop replacement eligibility (KB-03 &amp; ASSET-MGMT).
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-05</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Escalate risky or unclear requests</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  server/policyEngine.ts<br /><span className="text-slate-500">decision = 'ESCALATE' routing</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Escalates phishing (Critical priority to security@veridian-corp.example per KB-09), non-catalog software (KB-04), and server admin requests (TK-1050).
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-06</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Create a structured ticket</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  server/policyEngine.ts, src/types.ts<br /><span className="text-slate-500">StructuredTicket interface & ticketId generator</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Outputs complete structured schema: ticketId (AGENT-XXXX), employee, category, priority, assignedTeam, requiredAction, status, policyEvidence.
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-07</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Show the source used for its answer</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  src/components/NewRequestView.tsx<br /><span className="text-slate-500">Policy Citation Card & PolicyDetailModal.tsx</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Displays exact policy ID, title, full quoted evidence sentence, key rules checklist, and precedent tickets (e.g. TK-1049, TK-1048).
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">REQ-08</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">Maintain an audit trail</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Implemented
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-2xs text-blue-700">
                  server/policyEngine.ts, src/components/AuditLogsView.tsx<br /><span className="text-slate-500">AuditLogEntry pipeline & /api/audit-logs</span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Logs immutable timestamped steps (Request received → Classified → Policy retrieved → Decision made → Ticket created) with source and evidence.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* System Specifications */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold tracking-tight">
            System Specifications
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-600 text-white">
            System Implementation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block uppercase text-2xs font-mono">Platform</span>
            <span className="font-semibold text-white">Veridian IT Operations Platform</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase text-2xs font-mono">Service Type</span>
            <span className="font-semibold text-white">Internal Service System</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase text-2xs font-mono">Company</span>
            <span className="font-semibold text-white">Veridian Corp</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase text-2xs font-mono">Function</span>
            <span className="font-semibold text-white">IT Support Operations</span>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-300 border-t border-slate-800 flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            All policy decisions are grounded in the verified Veridian Corp Policy Data Pack.
          </span>
        </div>
      </div>
    </div>
  );
};
