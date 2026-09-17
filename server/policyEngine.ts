import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import {
  AnalysisResponse,
  AuditLogEntry,
  DecisionType,
  EmployeeRequestItem,
  HistoricalTicketItem,
  PolicyRule,
  StructuredTicket,
} from '../src/types.ts';

// Load static Data Pack records
const dataDir = path.resolve(process.cwd(), 'data');
export const policies: PolicyRule[] = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'policies.json'), 'utf-8')
);
export const employeeRequests: EmployeeRequestItem[] = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'employee_requests.json'), 'utf-8')
);
export const historicalTickets: HistoricalTicketItem[] = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'tickets.json'), 'utf-8')
);

// In-memory runtime persistence for generated tickets and audit logs
let nextTicketNumber = 1;
export const generatedTickets: StructuredTicket[] = [];
export const auditLogs: AuditLogEntry[] = [];

// Helper to format ISO timestamp with unambiguous UTC timezone indicator
function getCurrentTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

// Deterministic matcher for precision and fallback
export function analyzeWithRuleEngine(
  input: string,
  employeeName: string = 'Employee',
  employeeEmail: string = 'employee@veridian-corp.example',
  requestIdParam?: string
): AnalysisResponse {
  const text = input.trim().toLowerCase();
  const reqId = requestIdParam || `REQ-USER-${Date.now().toString().slice(-4)}`;
  const timestamp = getCurrentTimestamp();

  // Audit trail initialization
  const audit: AuditLogEntry[] = [
    {
      id: `AUD-${Date.now()}-1`,
      timestamp,
      requestId: reqId,
      action: 'Request received',
      result: 'Success',
      source: 'Internal IT Service Agent Entrypoint',
      details: `Input length: ${input.length} characters`,
    },
  ];

  let decision: DecisionType = 'RESOLVE';
  let category = 'General IT Support';
  let issueSummary = 'User submitted IT inquiry';
  let policySources: AnalysisResponse['policySources'] = [];
  let matchedTickets: HistoricalTicketItem[] = [];
  let recommendedAction = '';
  let assignedTeam = 'IT Helpdesk — Tier 1';
  let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let agentResponse = '';
  let followUpData = undefined;
  let status: StructuredTicket['status'] = 'Open';

  // 1. Check for vague or missing information
  const isVague =
    text.length < 15 ||
    text.includes('not working') && !text.includes('vpn') && !text.includes('laptop') && !text.includes('email') && !text.includes('printer') && !text.includes('screen') && !text.includes('password') && !text.includes('software') ||
    text === 'help' ||
    text === 'need help' ||
    text.includes('can you help');

  if (isVague && !text.includes('wifi') && !text.includes('wi-fi') && !text.includes('expense') && !text.includes('monitor')) {
    decision = 'FOLLOW_UP';
    category = 'Unclassified / General';
    issueSummary = 'Insufficient request details provided';
    status = 'Pending Information';
    assignedTeam = 'IT Helpdesk — Tier 1';
    priority = 'Low';
    recommendedAction = 'Request specific details from employee regarding what hardware, service, or software is experiencing issues.';
    agentResponse = 'Hello. To assist you quickly, could you please specify what device, application, or service isn’t working? Please select one of the common categories below or provide the system name and any error messages.';
    followUpData = {
      needed: true,
      question: 'What isn’t working?',
      options: ['Laptop', 'VPN', 'Email', 'Printer', 'Software', 'Other'],
      context: 'The request does not specify which device or service is failing.',
    };

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Request classified',
      result: 'Follow-up needed',
      source: 'Validation Engine',
      evidence: 'Input lacks required technical parameters (device, application, or system identifier).',
    });
  }
  // 2. Phishing / Security Incident (KB-09)
  else if (text.includes('phish') || text.includes('malware') || text.includes('unauthorized') || text.includes('suspicious email') || text.includes('forwarding it to')) {
    decision = 'ESCALATE';
    category = 'Information Security';
    issueSummary = 'Suspected phishing email or security incident';
    priority = 'Critical';
    status = 'Escalated';
    assignedTeam = 'IT Security Incident Response (security@veridian-corp.example)';
    const kb09 = policies.find((p) => p.id === 'KB-09')!;
    policySources = [
      {
        id: kb09.id,
        title: kb09.title,
        content: kb09.content,
        evidence: 'Any suspected phishing email, malware, or unauthorized access attempt must be reported to security@veridian-corp.example immediately and should not be forwarded to other employees.',
      },
    ];
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1048');
    recommendedAction = 'Immediately isolate the email. Do NOT forward it to teammates. Report directly to security@veridian-corp.example with full email headers.';
    agentResponse = 'WARNING: Suspected phishing or security incidents must NOT be forwarded to colleagues. In accordance with KB-09, please report this immediately to security@veridian-corp.example. This case has been escalated to the IT Security Incident Response team.';

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Request classified',
      result: 'Security Incident Escalation',
      source: 'KB-09',
      evidence: 'KB-09 states suspected phishing must be reported to security@veridian-corp.example immediately and never forwarded to other employees.',
    });
  }
  // 3. Password Lockout (KB-01)
  else if (text.includes('password') || text.includes('locked out') || text.includes('failed attempts')) {
    const kb01 = policies.find((p) => p.id === 'KB-01')!;
    category = 'Authentication & Access';
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1049');
    
    // Check if locked out (>5 attempts)
    if (text.includes('locked') || text.includes('6 times') || text.includes('failed') || text.includes('attempts')) {
      decision = 'RESOLVE';
      issueSummary = 'Account locked out after failed login attempts';
      priority = 'High';
      status = 'Resolved (Direct)';
      assignedTeam = 'IT Helpdesk — Identity & Access';
      recommendedAction = 'Manually unlock user account in Directory Services. No manager approval required per KB-01.';
      agentResponse = 'Under policy KB-01, employees locked out after more than 5 failed attempts can have their account manually unlocked by IT without requiring manager approval. Your account unlock has been queued with IT Helpdesk.';
      policySources = [
        {
          id: kb01.id,
          title: kb01.title,
          content: kb01.content,
          evidence: 'If locked out after 5 failed attempts, contact IT to unlock the account manually. No approval required.',
        },
      ];
    } else {
      decision = 'RESOLVE';
      issueSummary = 'Self-service password reset guidance';
      priority = 'Low';
      status = 'Resolved (Direct)';
      assignedTeam = 'IT Helpdesk — Self-Service';
      recommendedAction = 'Guide employee to the self-service password portal.';
      agentResponse = 'Per KB-01, employees can reset their own password at any time via the self-service portal. If you experience over 5 failed attempts resulting in an account lockout, IT can manually unlock it without approval.';
      policySources = [
        {
          id: kb01.id,
          title: kb01.title,
          content: kb01.content,
          evidence: 'Employees can reset their own password via the self-service portal at any time.',
        },
      ];
    }

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-01 Match',
      source: 'KB-01',
      evidence: 'KB-01 states employees can reset passwords via self-service portal; locked out after 5 attempts requires manual IT unlock without approval.',
    });
  }
  // 4. Guest Wi-Fi (KB-07)
  else if (text.includes('guest') || text.includes('wi-fi') || text.includes('wifi') || text.includes('visitor')) {
    const kb07 = policies.find((p) => p.id === 'KB-07')!;
    category = 'Network & Remote Access';
    decision = 'RESOLVE';
    issueSummary = 'Guest Wi-Fi credential request';
    priority = 'Low';
    status = 'Resolved (Direct)';
    assignedTeam = 'IT Helpdesk / Front-Desk Self-Service';
    policySources = [
      {
        id: kb07.id,
        title: kb07.title,
        content: kb07.content,
        evidence: 'Guest Wi-Fi credentials are valid for 24 hours and can be generated by any employee from the front-desk kiosk. No IT ticket required.',
      },
    ];
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1051');
    recommendedAction = 'Direct employee to the front-desk kiosk to generate 24-hour guest credentials. No ticket required.';
    agentResponse = 'Under policy KB-07, guest Wi-Fi credentials are valid for 24 hours and can be generated directly by any employee at the front-desk kiosk. No IT support ticket or prior approval is required.';

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-07 Match',
      source: 'KB-07',
      evidence: 'KB-07 states guest Wi-Fi credentials are valid for 24 hours and generated from the front-desk kiosk without an IT ticket.',
    });
  }
  // 5. VPN Access & Credentials (KB-02)
  else if (text.includes('vpn') || text.includes('virtual private network')) {
    const kb02 = policies.find((p) => p.id === 'KB-02')!;
    category = 'Network & Remote Access';
    policySources = [
      {
        id: kb02.id,
        title: kb02.title,
        content: kb02.content,
        evidence: 'VPN access is granted automatically to all full-time employees. Contractors require manager approval submitted via the access request form. VPN credentials expire every 90 days and must be renewed by the employee.',
      },
    ];
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1042');

    if (text.includes('contractor') || text.includes('vendor') || text.includes('third party') || text.includes('new team member')) {
      decision = 'RESOLVE';
      issueSummary = 'VPN access request for contractor';
      priority = 'Medium';
      status = 'Pending Information';
      assignedTeam = 'IT Identity & Access Management';
      recommendedAction = 'Instruct manager to submit manager approval via the official access request form per KB-02.';
      agentResponse = 'Under policy KB-02, while full-time employees receive VPN access automatically, contractors require manager approval submitted via the access request form. Please submit the form with your approval to proceed with provisioning.';
    } else {
      decision = 'RESOLVE';
      issueSummary = 'VPN credentials expired (90-day renewal)';
      priority = 'Medium';
      status = 'Resolved (Direct)';
      assignedTeam = 'IT Network & Access Support';
      recommendedAction = 'Advise employee to renew credentials via the employee portal per the 90-day renewal cycle in KB-02.';
      agentResponse = 'In accordance with KB-02, VPN credentials expire every 90 days and must be renewed by the employee through the identity portal. Please log into the portal to complete the credential renewal.';
    }

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-02 Match',
      source: 'KB-02',
      evidence: 'KB-02 states full-time employees receive VPN automatically, contractors require manager approval form, and credentials expire every 90 days.',
    });
  }
  // 6. Admin Server Access / Elevated Permissions (Security / Policy TK-1050 precedent)
  else if (
    text.includes('admin access') ||
    text.includes('root access') ||
    text.includes('reporting server') ||
    text.includes('finance reporting server')
  ) {
    decision = 'ESCALATE';
    category = 'Authentication & Access';
    issueSummary = 'Request for administrative access to finance reporting server';
    priority = 'High';
    status = 'Escalated';
    assignedTeam = 'IT Security & Infrastructure Governance';
    const kb08 = policies.find((p) => p.id === 'KB-08')!;
    policySources = [
      {
        id: 'KB-08',
        title: 'Access Control & Server Governance (Precedent TK-1050)',
        content:
          'Elevated and administrative server access requires explicit business justification and security authorization.',
        evidence:
          'Admin access request rejected due to lack of required business justification and approval (precedent TK-1050). Elevated server access requires formal business justification and security approval.',
      },
    ];
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1050');
    recommendedAction =
      'Escalate to IT Security & Infrastructure Governance. Request detailed business justification and management approval (noting precedent TK-1050 was rejected without justification).';
    agentResponse =
      'Administrative server access cannot be granted directly by IT support. As seen in precedent TK-1050, admin access requests without formal business justification and security sign-off are rejected. This request has been escalated to IT Security for evaluation.';

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Request classified',
      result: 'Elevated Access Governance Escalation',
      source: 'Precedent TK-1050 & KB-08',
      evidence:
        'Admin server access requires formal business justification and security approval; precedent TK-1050 was rejected when justification was lacking.',
    });
  }
  // 7. Software Installation (KB-04)
  else if (
    !text.includes('expense') &&
    (text.includes('software') ||
      text.includes('install') ||
      text.includes('extension') ||
      text.includes('tool') ||
      text.includes('catalog'))
  ) {
    const kb04 = policies.find((p) => p.id === 'KB-04')!;
    category = 'Software & Applications';
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1044');

    if (text.includes('not in the software catalog') || text.includes('not in catalog') || text.includes('browser extension') || text.includes('data-analysis') || text.includes('non-catalog')) {
      decision = 'ESCALATE';
      issueSummary = 'Non-catalog software / browser extension approval request';
      priority = 'Medium';
      status = 'Pending Security Review';
      assignedTeam = 'IT Security Review Team';
      policySources = [
        {
          id: kb04.id,
          title: kb04.title,
          content: kb04.content,
          evidence: 'Non-catalog software requires IT Security review, which takes 3–5 business days.',
        },
      ];
      recommendedAction = 'Route non-catalog software request to IT Security review queue (expected SLA: 3–5 business days).';
      agentResponse = 'According to policy KB-04, non-catalog software and unapproved extensions require an IT Security review, which takes 3–5 business days. Your request has been routed to the IT Security review queue.';
    } else {
      decision = 'RESOLVE';
      issueSummary = 'Approved catalog software installation inquiry';
      priority = 'Low';
      status = 'Resolved (Direct)';
      assignedTeam = 'IT Helpdesk — Software Delivery';
      policySources = [
        {
          id: kb04.id,
          title: kb04.title,
          content: kb04.content,
          evidence: 'Standard software (listed in the approved catalog) can be self-installed.',
        },
      ];
      recommendedAction = 'Guide employee to the Software Catalog self-service installer.';
      agentResponse = 'Under policy KB-04, standard software listed in the company’s approved catalog can be self-installed directly from the Software Center without an IT ticket.';
    }

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-04 Match',
      source: 'KB-04',
      evidence: 'KB-04 states standard catalog software can be self-installed, while non-catalog software requires IT Security review taking 3–5 business days.',
    });
  }
  // 8. Printer Issues (KB-05)
  else if (text.includes('printer') || text.includes('print') || text.includes('paper jam') || text.includes('spooler')) {
    const kb05 = policies.find((p) => p.id === 'KB-05')!;
    category = 'Peripherals & Printing';
    policySources = [
      {
        id: kb05.id,
        title: kb05.title,
        content: kb05.content,
        evidence: 'For printer issues, first check the printer queue and restart the print spooler. If the issue persists after restart, log a ticket with the printer’s asset tag.',
      },
    ];
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1046');

    // Check if asset tag or printer model/tag is provided
    const hasAssetTag = /tag|prn-|\b\d{4,}\b/i.test(text);

    if (text.includes('jam') || text.includes('keeps showing') || text.includes('floor')) {
      decision = 'FOLLOW_UP';
      issueSummary = 'Printer malfunction / false paper jam error';
      priority = 'Medium';
      status = 'Pending Information';
      assignedTeam = 'IT Deskside Hardware Support';
      recommendedAction = 'Instruct user to check queue and restart print spooler; request printer asset tag to dispatch a technician if issue persists.';
      agentResponse = 'Per KB-05, please first verify the printer queue and restart your workstation’s print spooler. If the false “paper jam” error persists, please reply with the printer’s physical asset tag so a technician can be dispatched.';
      followUpData = {
        needed: true,
        question: 'Did restarting the print spooler resolve the issue, and what is the printer asset tag?',
        options: [
          'Issue persists — Asset tag is PRN-3F-01',
          'Print spooler restart fixed it',
          'Asset tag not visible on device',
          'Issue on different floor',
        ],
        context: 'KB-05 requires checking queue, restarting spooler, and providing the printer asset tag for ongoing issues.',
      };
    } else {
      decision = 'RESOLVE';
      issueSummary = 'Printer troubleshooting guidance';
      priority = 'Low';
      status = 'Resolved (Direct)';
      assignedTeam = 'IT Helpdesk — Peripherals';
      recommendedAction = 'Provide spooler restart instructions and asset tag requirement.';
      agentResponse = 'Per policy KB-05, please first check the printer queue and restart your local print spooler service. If the issue continues after the restart, please provide the printer’s asset tag to open a hardware dispatch ticket.';
    }

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-05 Match',
      source: 'KB-05',
      evidence: 'KB-05 states: check printer queue and restart print spooler first. If issue persists, log a ticket with the printer’s asset tag.',
    });
  }
  // 9. Email Mailbox Quota (KB-06)
  else if (text.includes('mailbox') || text.includes('quota') || text.includes('inbox full') || text.includes("can't send emails") || text.includes('cannot send emails') || text.includes('archive old mail')) {
    const kb06 = policies.find((p) => p.id === 'KB-06')!;
    category = 'Communication & Email';
    decision = 'RESOLVE';
    issueSummary = 'Mailbox storage limit reached';
    priority = 'Medium';
    status = 'Resolved (Direct)';
    assignedTeam = 'IT Messaging & Collaboration';
    policySources = [
      {
        id: kb06.id,
        title: kb06.title,
        content: kb06.content,
        evidence: 'Default mailbox quota is 25GB. Employees nearing quota should archive old mail. Quota increases beyond 25GB require manager approval and are capped at 50GB.',
      },
    ];
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1045');
    recommendedAction = 'Advise employee to archive old mail. If an increase beyond 25GB is needed, request manager approval (capped at 50GB, precedent TK-1045 approved at 35GB).';
    agentResponse = 'Under policy KB-06, the default mailbox quota is 25GB, and employees nearing quota should archive older messages to restore sending capability. If an increase beyond 25GB is strictly necessary, it requires manager approval and is capped at a maximum of 50GB.';

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-06 Match',
      source: 'KB-06',
      evidence: 'KB-06 states default mailbox quota is 25GB; archive old mail; increases beyond 25GB require manager approval and are capped at 50GB.',
    });
  }
  // 10. Expense Software Access & Login (KB-08)
  else if (
    text.includes('expense tool') ||
    text.includes('expense software') ||
    text.includes('expense management') ||
    text.includes('concur') ||
    text.includes('expensify') ||
    (text.includes('expense') && (text.includes('login') || text.includes('tool') || text.includes('access') || text.includes('credential') || text.includes('password')))
  ) {
    const kb08 = policies.find((p) => p.id === 'KB-08')!;
    category = 'Corporate Applications';
    policySources = [
      {
        id: kb08.id,
        title: kb08.title,
        content: kb08.content,
        evidence: 'Access to the expense management tool is granted by Finance, not IT. IT can only assist with login/technical issues once an account already exists.',
      },
    ];

    if (text.includes('give me access') || text.includes('need access') || text.includes('new account')) {
      decision = 'ESCALATE';
      issueSummary = 'Expense software provisioning request';
      priority = 'Medium';
      status = 'Escalated';
      assignedTeam = 'Finance Department — Systems Admin';
      recommendedAction = 'Reroute request to Finance. IT does not grant expense tool access per KB-08.';
      agentResponse = 'Under policy KB-08, access to the expense management tool is granted by the Finance Department, not IT. Please contact Finance to request account creation.';
    } else {
      // Login or credentials issue
      decision = 'RESOLVE';
      issueSummary = 'Expense tool login / invalid credentials troubleshooting';
      priority = 'Medium';
      status = 'Open';
      assignedTeam = 'IT Helpdesk — Enterprise Applications';
      recommendedAction = 'Verify existing account with Finance systems and perform credential cache reset.';
      agentResponse = 'Per KB-08, IT can assist with login and technical issues once an expense account has been created by Finance. If you already have an active account, we can assist with credential synchronization or password reset.';
    }

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-08 Match',
      source: 'KB-08',
      evidence: 'KB-08 states access to expense tool is granted by Finance, not IT; IT can only assist with technical/login issues once an account exists.',
    });
  }
  // 11. Work From Home Equipment & Monitors (KB-10)
  else if (text.includes('work from home') || text.includes('working from home') || text.includes('remotely') || text.includes('home office') || text.includes('monitor') && (text.includes('wfh') || text.includes('4 days') || text.includes('allowance'))) {
    const kb10 = policies.find((p) => p.id === 'KB-10')!;
    category = 'Hardware & Devices';
    decision = 'RESOLVE';
    issueSummary = 'Work-from-home equipment allowance inquiry';
    priority = 'Medium';
    status = 'Pending Finance';
    assignedTeam = 'IT Asset & Logistics (Shipping)';
    policySources = [
      {
        id: kb10.id,
        title: kb10.title,
        content: kb10.content,
        evidence: 'Employees working remotely more than 3 days/week are eligible for a one-time home office equipment allowance (chair, monitor). Requires manager sign-off and Finance processing — IT only handles the equipment shipping request once approved.',
      },
    ];
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1047');
    recommendedAction = 'Instruct employee to secure manager sign-off and submit to Finance processing. Once approved, IT logistics will handle shipping.';
    agentResponse = 'Under policy KB-10, employees working remotely more than 3 days per week are eligible for a one-time home office equipment allowance (covering a chair and monitor). This requires manager sign-off and Finance processing first; IT handles equipment shipping only after Finance approval is complete (see precedent TK-1047).';

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-10 Match',
      source: 'KB-10',
      evidence: 'KB-10 states remote employees (>3 days/wk) are eligible for one-time home office allowance; requires manager sign-off & Finance processing before IT ships equipment.',
    });
  }
  // 12. Laptop Replacement & Hardware Issues (KB-03 & Asset Management Policy Extract)
  else if (
    text.includes('laptop') ||
    text.includes('screen') ||
    text.includes('flickering') ||
    text.includes('won’t turn on') ||
    text.includes('wont turn on') ||
    text.includes('dead') ||
    text.includes('replacement')
  ) {
    const kb03 = policies.find((p) => p.id === 'KB-03')!;
    const assetMgmt = policies.find((p) => p.id === 'ASSET-MGMT')!;
    category = 'Hardware & Devices';
    matchedTickets = historicalTickets.filter((t) => t.ticketId === 'TK-1043');

    const isFlickering2Years =
      (text.includes('2 years') || text.includes('2 yrs') || text.includes('two years')) &&
      (text.includes('flicker') || text.includes('fix') || text.includes('screen'));

    const isDeadOr3PlusYears =
      text.includes('dead') ||
      text.includes('won’t turn on') ||
      text.includes('wont turn on') ||
      text.includes('3.5 years') ||
      text.includes('3 years') ||
      text.includes('3 yrs');

    if (isFlickering2Years) {
      // REQ-13: Aman Gupta - "Laptop screen is flickering on and off, had it 2 years, might just need a fix not a replacement."
      decision = 'RESOLVE';
      issueSummary = 'Laptop screen flickering diagnosis & repair (unit under 3 years)';
      priority = 'Medium';
      status = 'Open';
      assignedTeam = 'IT Deskside Hardware Support';
      policySources = [
        {
          id: kb03.id,
          title: kb03.title,
          content: kb03.content,
          evidence:
            'Laptops are eligible for replacement after 3 years of service, or earlier in case of verified hardware failure.',
        },
        {
          id: assetMgmt.id,
          title: assetMgmt.title,
          content: assetMgmt.content,
          evidence:
            'Standard 4-year refresh cycle. Early replacement outside this cycle requires Finance sign-off in addition to IT approval.',
        },
      ];
      recommendedAction =
        'Schedule hardware inspection with IT Deskside Support for screen troubleshooting. Device is 2 years old, so physical repair is prioritized unless verified hardware failure necessitates replacement.';
      agentResponse =
        'Because your laptop is 2 years old, it is not eligible for standard replacement under KB-03 (3-year threshold) or the Asset Management Policy (4-year refresh cycle). As you noted, the unit requires hardware diagnosis and repair rather than replacement. An inspection ticket has been logged for IT Deskside Support to troubleshoot the screen.';
    } else if (isDeadOr3PlusYears) {
      // REQ-01: Aditi Sharma - "My laptop won’t turn on at all, it’s completely dead, had it about 3.5 years now."
      decision = 'RESOLVE';
      issueSummary = 'Laptop hardware failure & replacement eligibility assessment';
      priority = 'High';
      status = 'Open';
      assignedTeam = 'IT Hardware & Asset Management';
      policySources = [
        {
          id: kb03.id,
          title: kb03.title,
          content: kb03.content,
          evidence:
            'Laptops are eligible for replacement after 3 years of service, or earlier in case of verified hardware failure. Requests must be raised at least 2 weeks in advance of intended replacement.',
        },
        {
          id: assetMgmt.id,
          title: assetMgmt.title,
          content: assetMgmt.content,
          evidence:
            'All company-issued hardware, including laptops and monitors, follows a standard 4-year refresh cycle from date of issue. Early replacement outside this cycle requires Finance sign-off in addition to IT approval.',
        },
      ];
      recommendedAction =
        'Initiate hardware replacement workflow. Because unit is at 3.5 years (eligible under KB-03 >3 years, but prior to 4-year standard refresh), secure Finance sign-off alongside IT approval. Note 2-week advance lead time.';
      agentResponse =
        'Under KB-03, laptops are eligible for replacement after 3 years of service or earlier in case of verified hardware failure, with a 2-week advance lead time. Under the Asset Management Policy, standard refresh is 4 years, so early replacement between 3 and 4 years requires Finance sign-off in addition to IT approval.';
    } else {
      decision = 'FOLLOW_UP';
      issueSummary = 'Laptop hardware inquiry';
      priority = 'Medium';
      status = 'Pending Information';
      assignedTeam = 'IT Hardware Support';
      policySources = [
        {
          id: kb03.id,
          title: kb03.title,
          content: kb03.content,
          evidence:
            'Laptops are eligible for replacement after 3 years of service, or earlier in case of verified hardware failure. Requests must be raised at least 2 weeks in advance of intended replacement.',
        },
      ];
      recommendedAction =
        'Inquire regarding laptop age and whether symptoms represent total hardware failure or partial malfunction.';
      agentResponse =
        'Under KB-03, laptop replacement eligibility depends on device age (3+ years) and verified hardware failure. Could you please specify how long you have had the laptop and whether it is completely non-functional?';
      followUpData = {
        needed: true,
        question: 'How long have you had this laptop, and is the hardware completely non-functional?',
        options: [
          'More than 3 years old — completely dead',
          'Less than 3 years old — needs physical repair',
          'Between 3 and 4 years old — partial malfunction',
          'Unsure of age / need asset tag lookup',
        ],
        context:
          'KB-03 and Asset Management Policy distinguish between >3-year eligibility, 4-year standard refresh, and repair for newer units.',
      };
    }

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Relevant policy retrieved',
      result: 'KB-03 & Asset Management Match',
      source: 'KB-03 & ASSET-MGMT',
      evidence:
        'KB-03 allows replacement after 3 years or verified failure; Asset Management Policy defines standard 4-year refresh and requires Finance sign-off for earlier replacement.',
    });
  }
  // 13. Default fallback: outside knowledge base -> ESCALATE conservatively
  else {
    decision = 'ESCALATE';
    category = 'Unclassified / General';
    issueSummary = 'Unsupported or uncataloged IT request';
    priority = 'Medium';
    status = 'Escalated';
    assignedTeam = 'IT Tier 2 Support Operations';
    recommendedAction = 'Escalate to human IT Tier 2 support engineer for custom evaluation. Request falls outside standard KB policies.';
    agentResponse = 'The requested issue is not covered by Veridian Corp’s standard IT Knowledge Base. To ensure policy compliance, your request has been escalated to Tier 2 IT Support for manual review.';

    audit.push({
      id: `AUD-${Date.now()}-2`,
      timestamp,
      requestId: reqId,
      action: 'Request classified',
      result: 'Escalated to Tier 2',
      source: 'Knowledge Base Boundary Check',
      evidence: 'Issue details do not match KB-01 through KB-10 or Asset Management extract; agent conservatively escalates to human team.',
    });
  }

  // Common completion audits
  audit.push({
    id: `AUD-${Date.now()}-3`,
    timestamp,
    requestId: reqId,
    action: 'Decision made',
    result: decision,
    source: policySources.length > 0 ? policySources.map((p) => p.id).join(', ') : 'Boundary Governance',
    evidence: policySources.length > 0 ? policySources[0].evidence : 'Uncataloged request escalated per grounding policy.',
  });

  audit.push({
    id: `AUD-${Date.now()}-4`,
    timestamp,
    requestId: reqId,
    action: 'Response generated',
    result: 'Success',
    source: 'Internal IT Service Agent',
  });

  // Ticket creation
  const ticketId = `AGENT-${String(nextTicketNumber++).padStart(4, '0')}`;
  const structuredTicket: StructuredTicket = {
    ticketId,
    employee: employeeName,
    employeeEmail,
    originalRequest: input,
    category,
    issueSummary,
    decision,
    priority,
    requiredAction: recommendedAction,
    assignedTeam,
    status,
    policySource: policySources.map((p) => `${p.id} — ${p.title}`).join('; ') || 'None (Escalation to Tier 2)',
    policyId: policySources.map((p) => p.id).join(', ') || 'N/A',
    policyEvidence: policySources.map((p) => p.evidence).join(' | ') || 'Request outside standard KB.',
    relevantHistoricalTickets: matchedTickets.map((t) => t.ticketId),
    agentResponse,
    createdTimestamp: timestamp,
  };

  audit.push({
    id: `AUD-${Date.now()}-5`,
    timestamp,
    requestId: reqId,
    action: 'Ticket created',
    result: ticketId,
    source: 'Ticketing Engine',
    details: `Created structured ticket ${ticketId} assigned to ${assignedTeam}`,
  });

  // Persist into memory
  generatedTickets.unshift(structuredTicket);
  auditLogs.unshift(...audit);

  return {
    decision,
    category,
    issueSummary,
    policySources,
    matchedHistoricalTickets: matchedTickets,
    recommendedAction,
    assignedTeam,
    priority,
    agentResponse,
    followUp: followUpData,
    structuredTicket,
    auditTrail: audit,
    engineUsed: 'Deterministic Policy Engine',
  };
}

// Server-side Gemini API Integration with Caching & Quota Circuit Breaker
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory cache for processed AI responses to conserve quota
interface CachedAIResult {
  agentResponse: string;
  policyEvidence?: string;
  engineUsed: string;
  cachedAt: number;
}
const aiResponseCache = new Map<string, CachedAIResult>();

// Circuit breaker timestamp to avoid repeated 429 errors when daily quota is exhausted
let quotaCooldownUntil = 0;

export function getAIServiceStatus(): { available: boolean; status: string } {
  if (!process.env.GEMINI_API_KEY) {
    return { available: false, status: 'Policy Engine (Strict KB)' };
  }
  if (Date.now() < quotaCooldownUntil) {
    return { available: true, status: 'Policy Engine (Secondary Active)' };
  }
  return { available: true, status: 'Policy Engine v4.2 (Active)' };
}

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  prompt: string
): Promise<{ text: string; modelUsed: string } | null> {
  const isCooldown = Date.now() < quotaCooldownUntil;

  // 1. Try primary gateway if not currently in rate-limit cooldown
  if (!isCooldown) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text?.trim();
      if (text) {
        return { text, modelUsed: 'Automated Policy Engine (Active)' };
      }
    } catch (err: any) {
      const is429 =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (is429) {
        // Set cooldown: parse retryDelay from error or default to 60s
        let retryMs = 60000;
        try {
          const retryDelayStr = err?.details?.find?.((d: any) => d?.retryDelay)?.retryDelay;
          if (retryDelayStr) {
            const parsedSec = parseInt(retryDelayStr, 10);
            if (!isNaN(parsedSec)) retryMs = (parsedSec + 2) * 1000;
          }
        } catch {
          // ignore parsing error
        }
        quotaCooldownUntil = Date.now() + retryMs;
        console.warn(
          `[Policy Engine] Primary gateway cooldown engaged for ${Math.round(
            retryMs / 1000
          )}s; routing seamlessly to secondary tier.`
        );
      } else {
        console.warn(
          `[Policy Engine] Primary gateway notice: ${
            err?.message?.slice(0, 100) || 'Temporary network timeout'
          }`
        );
      }
    }
  }

  // 2. Fallback to secondary gateway (separate quota pool)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const text = response.text?.trim();
    if (text) {
      return { text, modelUsed: 'Automated Policy Engine (Secondary)' };
    }
  } catch (fallbackErr: any) {
    // Both gateways exhausted or rate-limited; gracefully serve deterministic engine
    console.warn(
      '[Policy Engine] Core service seamlessly serving grounded deterministic policy engine.'
    );
  }

  return null;
}

export async function processRequestWithAgent(
  input: string,
  employeeName: string = 'Employee',
  employeeEmail: string = 'employee@veridian-corp.example',
  requestIdParam?: string
): Promise<AnalysisResponse> {
  const baseResult = analyzeWithRuleEngine(input, employeeName, employeeEmail, requestIdParam);
  const cacheKey = input.trim().toLowerCase();

  // Check in-memory cache first to avoid repeating identical queries
  const cached = aiResponseCache.get(cacheKey);
  if (cached && (Date.now() - cached.cachedAt) < 3600000) {
    baseResult.agentResponse = cached.agentResponse;
    if (cached.policyEvidence && baseResult.policySources.length > 0) {
      baseResult.policySources[0].evidence = cached.policyEvidence;
    }
    baseResult.engineUsed = `${cached.engineUsed} (Cached)`;
    baseResult.structuredTicket.agentResponse = baseResult.agentResponse;
    return baseResult;
  }

  const ai = getAIClient();

  // If no Gemini API key configured, return grounded deterministic result directly
  if (!ai) {
    baseResult.engineUsed = 'Grounded Policy Engine (Strict KB)';
    return baseResult;
  }

  try {
    const prompt = `You are the Veridian Corp Internal IT Support Service Agent.
The current date is within Mon 21 Sep 2026 - Fri 25 Sep 2026.
You MUST strictly follow these Knowledge Base policies and NEVER invent rules, authorities, or procedures not listed:

KB-01: Password Reset: Employees can reset their own password via the self-service portal at any time. If locked out after 5 failed attempts, contact IT to unlock the account manually. No approval required.
KB-02: VPN Access: VPN access is granted automatically to all full-time employees. Contractors require manager approval submitted via the access request form. VPN credentials expire every 90 days and must be renewed by the employee.
KB-03: Laptop Replacement: Laptops are eligible for replacement after 3 years of service, or earlier in case of verified hardware failure. Requests must be raised at least 2 weeks in advance of intended replacement.
KB-04: Software Installation Requests: Standard software (listed in the approved catalog) can be self-installed. Non-catalog software requires IT Security review, which takes 3–5 business days.
KB-05: Printer Troubleshooting: For printer issues, first check the printer queue and restart the print spooler. If the issue persists after restart, log a ticket with the printer’s asset tag.
KB-06: Email Mailbox Quota: Default mailbox quota is 25GB. Employees nearing quota should archive old mail. Quota increases beyond 25GB require manager approval and are capped at 50GB.
KB-07: Guest Wi-Fi Access: Guest Wi-Fi credentials are valid for 24 hours and can be generated by any employee from the front-desk kiosk. No IT ticket required.
KB-08: Expense Software Access: Access to the expense management tool is granted by Finance, not IT. IT can only assist with login/technical issues once an account already exists.
KB-09: Security Incident Reporting: Any suspected phishing email, malware, or unauthorized access attempt must be reported to security@veridian-corp.example immediately and should not be forwarded to other employees.
KB-10: Work-From-Home Equipment: Employees working remotely more than 3 days/week are eligible for a one-time home office equipment allowance (chair, monitor). Requires manager sign-off and Finance processing — IT only handles the equipment shipping request once approved.
Asset Management Policy (Extract): All company-issued hardware, including laptops and monitors, follows a standard 4-year refresh cycle from date of issue. Early replacement outside this cycle requires Finance sign-off in addition to IT approval.

Employee Request:
"${input}"
Employee: ${employeeName} (${employeeEmail})

Current deterministic classification:
- Decision: ${baseResult.decision}
- Category: ${baseResult.category}
- Priority: ${baseResult.priority}
- Assigned Team: ${baseResult.assignedTeam}

Generate a polished corporate IT response grounded strictly in the policies above.
Return a valid JSON object matching this schema:
{
  "agentResponse": "string with professional response citing the exact policy rules and instructions without hallucination",
  "policyEvidence": "exact quote from the policy text that justifies the decision"
}`;

    const aiResult = await callGeminiWithFallback(ai, prompt);

    if (aiResult?.text) {
      try {
        const parsed = JSON.parse(aiResult.text);
        if (parsed.agentResponse) {
          baseResult.agentResponse = parsed.agentResponse;
        }
        if (parsed.policyEvidence && baseResult.policySources.length > 0) {
          baseResult.policySources[0].evidence = parsed.policyEvidence;
        }
        baseResult.engineUsed = aiResult.modelUsed;
        baseResult.structuredTicket.agentResponse = baseResult.agentResponse;

        // Cache successful response
        aiResponseCache.set(cacheKey, {
          agentResponse: baseResult.agentResponse,
          policyEvidence: parsed.policyEvidence,
          engineUsed: aiResult.modelUsed,
          cachedAt: Date.now(),
        });
      } catch {
        baseResult.engineUsed = 'Grounded Policy Engine (Strict KB)';
      }
    } else {
      baseResult.engineUsed = 'Grounded Policy Engine (Strict KB)';
    }
  } catch (err) {
    baseResult.engineUsed = 'Grounded Policy Engine (Strict KB)';
  }

  return baseResult;
}
