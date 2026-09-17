/**
 * Automated Verification Suite for Veridian Corp Internal IT Service Agent
 * Assignment 2 — Internal Service Agent
 * STRICT SOURCE-GROUNDED VERIFICATION AGAINST DATA PACK
 */

import { analyzeWithRuleEngine, policies, employeeRequests, historicalTickets } from '../server/policyEngine.ts';

function runTestSuite() {
  console.log('====================================================');
  console.log('VERIDIAN CORP IT AGENT — STRICT SOURCE GROUNDING TEST');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
    }
  }

  // 1. Data Pack Integrity Check
  assert(policies.length === 11, 'Policies count equals 11 (KB-01 through KB-10 + Asset Management Policy)');
  assert(employeeRequests.length === 15, 'Employee requests count equals 15 (REQ-01 through REQ-15)');
  assert(historicalTickets.length === 10, 'Historical tickets count equals 10 (TK-1042 through TK-1051)');

  // Ensure no invented policies exist
  const allowedPolicyIds = new Set([
    'KB-01', 'KB-02', 'KB-03', 'KB-04', 'KB-05',
    'KB-06', 'KB-07', 'KB-08', 'KB-09', 'KB-10', 'ASSET-MGMT',
  ]);
  const allPolicyIdsValid = policies.every((p) => allowedPolicyIds.has(p.id));
  assert(allPolicyIdsValid, 'Zero invented policies (only KB-01..KB-10 and ASSET-MGMT exist)');

  // 2. REQ-01 through REQ-15 Grounding Verification against Data Pack
  // REQ-01: Aditi Sharma (Dead laptop, 3.5 years old)
  const req1 = employeeRequests.find((r) => r.id === 'REQ-01')!;
  const res1 = analyzeWithRuleEngine(req1.request, req1.employee, req1.email, req1.id);
  assert(res1.decision === 'RESOLVE', 'REQ-01 (Aditi Sharma - 3.5yr dead laptop) -> Decision RESOLVE');
  assert(res1.policySources.some((p) => p.id === 'KB-03'), 'REQ-01 cites KB-03 (Laptop Replacement)');
  assert(res1.policySources.some((p) => p.id === 'ASSET-MGMT'), 'REQ-01 cites ASSET-MGMT (Finance sign-off for <4yr refresh)');
  assert(res1.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1043'), 'REQ-01 matches precedent TK-1043');

  // REQ-02: Vikram Chawla (Guest Wi-Fi)
  const req2 = employeeRequests.find((r) => r.id === 'REQ-02')!;
  const res2 = analyzeWithRuleEngine(req2.request, req2.employee, req2.email, req2.id);
  assert(res2.decision === 'RESOLVE', 'REQ-02 (Vikram Chawla - Guest Wi-Fi) -> Decision RESOLVE');
  assert(res2.policySources.some((p) => p.id === 'KB-07'), 'REQ-02 cites KB-07 (Guest Wi-Fi Access)');
  assert(res2.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1051'), 'REQ-02 matches precedent TK-1051');
  assert(res2.agentResponse.includes('kiosk'), 'REQ-02 directs employee to front-desk kiosk');

  // REQ-03: Karan Mehta (Account lockout after 6 attempts)
  const req3 = employeeRequests.find((r) => r.id === 'REQ-03')!;
  const res3 = analyzeWithRuleEngine(req3.request, req3.employee, req3.email, req3.id);
  assert(res3.decision === 'RESOLVE', 'REQ-03 (Karan Mehta - Password Lockout) -> Decision RESOLVE');
  assert(res3.policySources.some((p) => p.id === 'KB-01'), 'REQ-03 cites KB-01 (Password Reset)');
  assert(res3.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1049'), 'REQ-03 matches precedent TK-1049');

  // REQ-04: Ritu Bhatia (Non-catalog data-analysis tool)
  const req4 = employeeRequests.find((r) => r.id === 'REQ-04')!;
  const res4 = analyzeWithRuleEngine(req4.request, req4.employee, req4.email, req4.id);
  assert(res4.decision === 'ESCALATE', 'REQ-04 (Ritu Bhatia - Non-catalog software) -> Decision ESCALATE');
  assert(res4.policySources.some((p) => p.id === 'KB-04'), 'REQ-04 cites KB-04 (Software Installation)');
  assert(res4.assignedTeam.includes('Security'), 'REQ-04 escalated to IT Security queue (3-5 days)');
  assert(res4.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1044'), 'REQ-04 matches precedent TK-1044');

  // REQ-05: Sanjay Oberoi (VPN credentials expired)
  const req5 = employeeRequests.find((r) => r.id === 'REQ-05')!;
  const res5 = analyzeWithRuleEngine(req5.request, req5.employee, req5.email, req5.id);
  assert(res5.decision === 'RESOLVE', 'REQ-05 (Sanjay Oberoi - VPN Expiry) -> Decision RESOLVE');
  assert(res5.policySources.some((p) => p.id === 'KB-02'), 'REQ-05 cites KB-02 (VPN Access 90-day renewal)');
  assert(res5.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1042'), 'REQ-05 matches precedent TK-1042');

  // REQ-06: Meera Iyer (Printer 3rd floor false paper jam)
  const req6 = employeeRequests.find((r) => r.id === 'REQ-06')!;
  const res6 = analyzeWithRuleEngine(req6.request, req6.employee, req6.email, req6.id);
  assert(res6.decision === 'FOLLOW_UP', 'REQ-06 (Meera Iyer - Printer Paper Jam) -> Decision FOLLOW_UP');
  assert(res6.policySources.some((p) => p.id === 'KB-05'), 'REQ-06 cites KB-05 (Printer Troubleshooting)');
  assert(res6.followUp?.needed === true, 'REQ-06 requests spooler check and asset tag');
  assert(res6.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1046'), 'REQ-06 matches precedent TK-1046');

  // REQ-07: Farhan Ali (WFH 4 days/week monitor request)
  const req7 = employeeRequests.find((r) => r.id === 'REQ-07')!;
  const res7 = analyzeWithRuleEngine(req7.request, req7.employee, req7.email, req7.id);
  assert(res7.decision === 'RESOLVE', 'REQ-07 (Farhan Ali - WFH Monitor) -> Decision RESOLVE');
  assert(res7.policySources.some((p) => p.id === 'KB-10'), 'REQ-07 cites KB-10 (Work-From-Home Equipment)');
  assert(res7.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1047'), 'REQ-07 matches precedent TK-1047');

  // REQ-08: Ananya Reddy (Phishing email reported, forwarding to teammates)
  const req8 = employeeRequests.find((r) => r.id === 'REQ-08')!;
  const res8 = analyzeWithRuleEngine(req8.request, req8.employee, req8.email, req8.id);
  assert(res8.decision === 'ESCALATE', 'REQ-08 (Ananya Reddy - Phishing) -> Decision ESCALATE');
  assert(res8.policySources.some((p) => p.id === 'KB-09'), 'REQ-08 cites KB-09 (Security Incident Reporting)');
  assert(res8.priority === 'Critical', 'REQ-08 marked Critical priority per security incident protocol');
  assert(res8.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1048'), 'REQ-08 matches precedent TK-1048');

  // REQ-09: Rohit Desai (Mailbox full)
  const req9 = employeeRequests.find((r) => r.id === 'REQ-09')!;
  const res9 = analyzeWithRuleEngine(req9.request, req9.employee, req9.email, req9.id);
  assert(res9.decision === 'RESOLVE', 'REQ-09 (Rohit Desai - Mailbox Quota) -> Decision RESOLVE');
  assert(res9.policySources.some((p) => p.id === 'KB-06'), 'REQ-09 cites KB-06 (Email Mailbox Quota 25GB/50GB)');
  assert(res9.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1045'), 'REQ-09 matches precedent TK-1045');

  // REQ-10: Kavya Pillai (Server admin access urgently)
  const req10 = employeeRequests.find((r) => r.id === 'REQ-10')!;
  const res10 = analyzeWithRuleEngine(req10.request, req10.employee, req10.email, req10.id);
  assert(res10.decision === 'ESCALATE', 'REQ-10 (Kavya Pillai - Admin Access) -> Decision ESCALATE');
  assert(res10.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1050'), 'REQ-10 matches precedent TK-1050 (rejected admin access)');

  // REQ-11: Nikhil Bansal (Contractor VPN access)
  const req11 = employeeRequests.find((r) => r.id === 'REQ-11')!;
  const res11 = analyzeWithRuleEngine(req11.request, req11.employee, req11.email, req11.id);
  assert(res11.decision === 'RESOLVE', 'REQ-11 (Nikhil Bansal - Contractor VPN) -> Decision RESOLVE');
  assert(res11.policySources.some((p) => p.id === 'KB-02'), 'REQ-11 cites KB-02 (Contractor approval required via form)');

  // REQ-12: Sneha Kulkarni (Expense tool invalid credentials)
  const req12 = employeeRequests.find((r) => r.id === 'REQ-12')!;
  const res12 = analyzeWithRuleEngine(req12.request, req12.employee, req12.email, req12.id);
  assert(res12.decision === 'RESOLVE', 'REQ-12 (Sneha Kulkarni - Expense Tool Login) -> Decision RESOLVE');
  assert(res12.policySources.some((p) => p.id === 'KB-08'), 'REQ-12 cites KB-08 (Expense Software Access)');

  // REQ-13: Aman Gupta (Laptop screen flickering, 2 years old, needs fix not replacement)
  const req13 = employeeRequests.find((r) => r.id === 'REQ-13')!;
  const res13 = analyzeWithRuleEngine(req13.request, req13.employee, req13.email, req13.id);
  assert(res13.decision === 'RESOLVE', 'REQ-13 (Aman Gupta - 2yr screen flickering) -> Decision RESOLVE');
  assert(res13.policySources.some((p) => p.id === 'KB-03'), 'REQ-13 cites KB-03');
  assert(res13.policySources.some((p) => p.id === 'ASSET-MGMT'), 'REQ-13 cites ASSET-MGMT');
  assert(res13.agentResponse.includes('2 years old') && (res13.agentResponse.includes('repair') || res13.agentResponse.includes('troubleshoot')), 'REQ-13 correctly identifies unit as under 3-yr threshold and routes for screen repair/diagnostic');

  // REQ-14: Tanya Chopra (Browser extension for productivity tracking)
  const req14 = employeeRequests.find((r) => r.id === 'REQ-14')!;
  const res14 = analyzeWithRuleEngine(req14.request, req14.employee, req14.email, req14.id);
  assert(res14.decision === 'ESCALATE', 'REQ-14 (Tanya Chopra - Browser Extension) -> Decision ESCALATE');
  assert(res14.policySources.some((p) => p.id === 'KB-04'), 'REQ-14 cites KB-04 (Non-catalog software requires IT Security review)');
  assert(res14.assignedTeam.includes('Security'), 'REQ-14 escalated to IT Security team (3-5 days)');
  assert(res14.matchedHistoricalTickets.some((t) => t.ticketId === 'TK-1044'), 'REQ-14 matches precedent TK-1044');

  // REQ-15: Rahul Menon (Vague request "hey can you help, its not working")
  const req15 = employeeRequests.find((r) => r.id === 'REQ-15')!;
  const res15 = analyzeWithRuleEngine(req15.request, req15.employee, req15.email, req15.id);
  assert(res15.decision === 'FOLLOW_UP', 'REQ-15 (Rahul Menon - Vague request) -> Decision FOLLOW_UP');
  assert(res15.followUp?.needed === true, 'REQ-15 prompts for clarification');

  // 3. Negative Boundary Tests (Out of scope requests MUST ESCALATE without inventing policies)
  const resTravel = analyzeWithRuleEngine('Can you book my flight to London for the quarterly offsite?', 'User', 'user@veridian-corp.example');
  assert(resTravel.decision === 'ESCALATE', 'Out-of-scope non-IT request -> Decision ESCALATE');
  assert(resTravel.assignedTeam.includes('Tier 2'), 'Escalated to Tier 2 support operations');

  const resMouse = analyzeWithRuleEngine('My computer mouse broke and scroll wheel is unresponsive', 'User', 'user@veridian-corp.example');
  assert(resMouse.decision === 'ESCALATE', 'Peripheral request not covered by Data Pack -> Escalate to Tier 2');

  // 4. Verification that All 15 requests produce full structured artifacts
  let allArtifactsPresent = true;
  for (const item of employeeRequests) {
    const analysis = analyzeWithRuleEngine(item.request, item.employee, item.email, item.id);
    if (!analysis.decision || !analysis.category || !analysis.structuredTicket || !analysis.auditTrail || !analysis.policySources) {
      allArtifactsPresent = false;
    }
  }
  assert(allArtifactsPresent, 'All 15 employee requests generate structured tickets, audit trails, and policy sources');

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite();
