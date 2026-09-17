/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar, TabType } from './components/Sidebar.tsx';
import { NewRequestView } from './components/NewRequestView.tsx';
import { EmployeeRequestsView } from './components/EmployeeRequestsView.tsx';
import { TicketQueueView } from './components/TicketQueueView.tsx';
import { KnowledgeBaseView } from './components/KnowledgeBaseView.tsx';
import { AuditLogsView } from './components/AuditLogsView.tsx';
import { DemoModeView } from './components/DemoModeView.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { PolicyDetailModal } from './components/PolicyDetailModal.tsx';
import {
  AnalysisResponse,
  AuditLogEntry,
  DemoTestCase,
  EmployeeRequestItem,
  HistoricalTicketItem,
  PolicyRule,
  StructuredTicket,
} from './types.ts';

// Initial fallback data from data folder
import fallbackPolicies from '../data/policies.json';
import fallbackRequests from '../data/employee_requests.json';
import fallbackTickets from '../data/tickets.json';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('new-request');
  const [policies, setPolicies] = useState<PolicyRule[]>(fallbackPolicies as PolicyRule[]);
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequestItem[]>(fallbackRequests as EmployeeRequestItem[]);
  const [historicalTickets, setHistoricalTickets] = useState<HistoricalTicketItem[]>(fallbackTickets as HistoricalTicketItem[]);
  const [generatedTickets, setGeneratedTickets] = useState<StructuredTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResponse | null>(null);
  const [selectedPolicyForModal, setSelectedPolicyForModal] = useState<PolicyRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [engineStatus, setEngineStatus] = useState<string>('Online');

  // Fetch initial data from server
  const refreshData = async () => {
    try {
      const [healthRes, policiesRes, reqsRes, ticketsRes, auditRes] = await Promise.all([
        fetch('/api/health').catch(() => null),
        fetch('/api/policies').catch(() => null),
        fetch('/api/employee-requests').catch(() => null),
        fetch('/api/tickets').catch(() => null),
        fetch('/api/audit-logs').catch(() => null),
      ]);

      if (healthRes && healthRes.ok) {
        const health = await healthRes.json();
        setEngineStatus(health.engine || 'Policy Engine v4.2 (Active)');
      }

      if (policiesRes && policiesRes.ok) {
        const data = await policiesRes.json();
        if (data.policies) setPolicies(data.policies);
      }

      if (reqsRes && reqsRes.ok) {
        const data = await reqsRes.json();
        if (data.employeeRequests) setEmployeeRequests(data.employeeRequests);
      }

      if (ticketsRes && ticketsRes.ok) {
        const data = await ticketsRes.json();
        if (data.historicalTickets) setHistoricalTickets(data.historicalTickets);
        if (data.generatedTickets) setGeneratedTickets(data.generatedTickets);
      }

      if (auditRes && auditRes.ok) {
        const data = await auditRes.json();
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.warn('Initial server sync warning:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Main Analyze Request handler
  const handleAnalyze = async (
    input: string,
    name?: string,
    email?: string,
    reqId?: string
  ): Promise<AnalysisResponse | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          employeeName: name,
          employeeEmail: email,
          requestId: reqId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: AnalysisResponse = await response.json();
      setCurrentResult(result);
      if (result.engineUsed) {
        setEngineStatus(result.engineUsed);
      }

      // Append structured ticket to runtime state
      setGeneratedTickets((prev) => [result.structuredTicket, ...prev]);
      setAuditLogs((prev) => [...result.auditTrail, ...prev]);

      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Process a Data Pack request from the Employee Requests table
  const handleProcessEmployeeRequest = async (request: EmployeeRequestItem) => {
    setActiveTab('new-request');
    await handleAnalyze(request.request, request.employee, request.email, request.id);
  };

  // Run a demo test case
  const handleRunDemoTest = async (test: DemoTestCase): Promise<AnalysisResponse | null> => {
    const result = await handleAnalyze(
      test.sampleInput,
      'Veridian Employee',
      'employee@veridian-corp.example',
      test.id
    );
    return result;
  };

  // Reset runtime session tickets & audit logs
  const handleResetSession = async () => {
    try {
      await fetch('/api/reset-session', { method: 'POST' });
    } catch (e) {
      console.warn(e);
    }
    setGeneratedTickets([]);
    setAuditLogs([]);
    setCurrentResult(null);
  };

  const openTicketsCount = historicalTickets.filter((t) => t.isActive).length + generatedTickets.filter((t) => t.decision !== 'RESOLVE').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        activeTicketsCount={openTicketsCount}
        totalPoliciesCount={policies.length}
        engineStatus={engineStatus}
      />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          unresolvedRequestsCount={employeeRequests.length}
          openTicketsCount={openTicketsCount}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'new-request' && (
            <NewRequestView
              onAnalyze={handleAnalyze}
              policies={policies}
              sampleRequests={employeeRequests}
              currentResult={currentResult}
              isLoading={isLoading}
              onOpenPolicy={(p) => setSelectedPolicyForModal(p)}
              onClear={() => setCurrentResult(null)}
            />
          )}

          {activeTab === 'demo' && (
            <DemoModeView
              onRunTest={handleRunDemoTest}
              policies={policies}
              onOpenPolicy={(p) => setSelectedPolicyForModal(p)}
            />
          )}

          {activeTab === 'requests' && (
            <EmployeeRequestsView
              requests={employeeRequests}
              onProcessRequest={handleProcessEmployeeRequest}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketQueueView
              historicalTickets={historicalTickets}
              generatedTickets={generatedTickets}
            />
          )}

          {activeTab === 'kb' && (
            <KnowledgeBaseView
              policies={policies}
              onOpenPolicy={(p) => setSelectedPolicyForModal(p)}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView
              auditLogs={auditLogs}
              onResetSession={handleResetSession}
            />
          )}

          {(activeTab === 'architecture' || activeTab === 'about') && (
            <ArchitectureView />
          )}
        </main>
      </div>

      {/* Full Policy Modal */}
      <PolicyDetailModal
        policy={selectedPolicyForModal}
        onClose={() => setSelectedPolicyForModal(null)}
      />
    </div>
  );
}
