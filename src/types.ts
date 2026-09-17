export type DecisionType = 'RESOLVE' | 'FOLLOW_UP' | 'ESCALATE';

export interface PolicyRule {
  id: string;
  title: string;
  category: string;
  content: string;
  keyRules: string[];
  applicableRoles: string[];
}

export interface EmployeeRequestItem {
  id: string;
  employee: string;
  email: string;
  dateOpened: string;
  request: string;
  initialAction: string;
  categoryHint?: string;
  expectedDecision?: DecisionType;
  notes?: string;
}

export interface HistoricalTicketItem {
  ticketId: string;
  employee: string;
  issueSummary: string;
  status: string;
  isActive: boolean;
  relatedPolicyId: string;
  resolutionNotes: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  requestId: string;
  action: string;
  result: string;
  source: string;
  evidence?: string;
  details?: string;
}

export interface FollowUpData {
  needed: boolean;
  question: string;
  options: string[];
  context?: string;
}

export interface StructuredTicket {
  ticketId: string; // e.g. AGENT-0001
  employee: string;
  employeeEmail: string;
  originalRequest: string;
  category: string;
  issueSummary: string;
  decision: DecisionType;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requiredAction: string;
  assignedTeam: string;
  status: 'Open' | 'Resolved (Direct)' | 'Pending Information' | 'Escalated' | 'Pending Security Review' | 'Pending Finance';
  policySource: string;
  policyId: string;
  policyEvidence: string;
  relevantHistoricalTickets: string[];
  agentResponse: string;
  createdTimestamp: string;
}

export interface AnalysisResponse {
  decision: DecisionType;
  category: string;
  issueSummary: string;
  policySources: {
    id: string;
    title: string;
    content: string;
    evidence: string;
  }[];
  matchedHistoricalTickets: HistoricalTicketItem[];
  recommendedAction: string;
  assignedTeam: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  agentResponse: string;
  followUp?: FollowUpData;
  structuredTicket: StructuredTicket;
  auditTrail: AuditLogEntry[];
  engineUsed:
    | 'Automated Policy Engine (Active)'
    | 'Automated Policy Engine (Secondary)'
    | 'Deterministic Policy Engine'
    | 'Grounded Policy Engine (Strict KB)'
    | string;
}

export interface DemoTestCase {
  id: string;
  name: string;
  category: string;
  scenario: string;
  sampleInput: string;
  expectedDecision: DecisionType;
  expectedPolicy: string;
  rationale: string;
}
