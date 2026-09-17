# Veridian Corp — Internal IT Support Service Agent

> **Agentic AI Factory — Assignment 2: Internal Service Agent (IT Support)**  
> Built for Veridian Corp (Exercise Simulation Period: Mon 21 Sep – Fri 25 Sep 2026)

---

## 1. Project Overview & Problem Statement

Modern enterprise IT service desks receive hundreds of repetitive tickets ranging from basic password lockouts and guest Wi-Fi passes to complex security incidents and elevated server permission requests. Traditional chatbots often hallucinate company policies, invent approval workflows, or grant unauthorized permissions without validation.

The **Veridian Corp Internal IT Service Agent** is a production-grade, AI-powered internal IT support agent that operates under **strict policy grounding**. Using the official Veridian Corp assignment Data Pack as its sole source of truth, the agent:
1. Understands employee requests in natural language.
2. Identifies and cites the relevant policy from the Knowledge Base (KB-01 to KB-10 and Asset Management Policy Extract).
3. Evaluates historical ticket precedent (TK-1042 to TK-1051) for context and consistency.
4. Distinguishes deterministically between **RESOLVE**, **FOLLOW_UP**, and **ESCALATE**.
5. Prompts users with structured questions when information is insufficient (e.g., vague requests).
6. Creates structured internal tickets (`AGENT-0001`, etc.) with audit trails and explicit policy citations.
7. **Never hallucinates authority** or claims an action was executed if the system cannot perform it.

---

## 2. Key Assignment Requirements Addressed

| Requirement | Implementation |
| :--- | :--- |
| **Strict Data Pack Grounding** | Grounded exclusively in KB-01 to KB-10, Asset Management Policy Extract, and Tickets TK-1042–TK-1051. |
| **No Hallucinated Policies** | Zero invented procedures, approval requirements, or employee identities. |
| **Three-Way Decision Engine** | Explicit categorization into `RESOLVE`, `FOLLOW_UP`, or `ESCALATE` (no arbitrary confidence scores). |
| **All 15 Employee Requests** | REQ-01 through REQ-15 pre-loaded with original wording, date opened, and 1-click agent processing. |
| **Historical Precedent Queue** | Distinguishes Active cases from Closed precedent records (e.g. TK-1050 rejection of admin rights). |
| **Interactive Follow-ups** | Handles vague input (e.g. "hey can you help, its not working") by asking minimal category questions. |
| **Structured Ticket Creation** | Generates standardized tickets (`AGENT-XXXX`) with SLA, category, priority, and assigned team. |
| **Transparent Audit Trail** | Timestamped chronological milestones showing policy citations without exposing private chain-of-thought. |
| **Server-Side AI Security** | Gemini 3.8-Flash executed purely server-side with deterministic rule engine fallback. No browser key exposure. |
| **Interactive Demo Mode** | 10 built-in test scenarios with single-click execution and automated batch validation. |

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend:** Node.js, Express 4, `tsx` runtime, `esbuild` for CJS production bundling.
- **AI Intelligence:** Gemini 3.8-Flash via official `@google/genai` SDK (server-side only).
- **Safety & Grounding:** Dual-engine architecture (Gemini natural language synthesis + deterministic Data Pack rule engine).
- **Data Persistence:** Local JSON data models in `/data/` and in-memory runtime session store for active tickets and audit logs.
- **Testing:** Automated test suite (`test/agent.test.ts`) covering 33 unit and policy assertions.

---

## 4. Agent Architecture & Workflow

```
                         Employee Input
                      (Natural Language)
                              │
                              ▼
                     Request Understanding
                    & Technical Extraction
                              │
                              ▼
                     Issue Classification
                     (Intent & Categories)
                              │
                              ▼
                    Policy & Ticket Search
                   (Data Pack KB-01 – KB-10
                    & Tickets TK-1042–1051)
                              │
                              ▼
                 Policy-Grounded Decision Engine
                 (Evaluates Authority & Rules)
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
       RESOLVE            FOLLOW_UP            ESCALATE
   (Direct solution   (Missing parameter  (Security incident,
    authorized by KB)    or vague issue)    non-catalog soft,
                                           admin rights, etc.)
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                      Structured Ticket
                   (ID: AGENT-0001, SLA,
                    Assigned Team, Copy)
                              │
                              ▼
                     Verifiable Audit Trail
                   (Timestamped Citations)
```

---

## 5. Grounded Policy Knowledge Base Summary

All decisions are directly mapped to the supplied Veridian Corp policies:

- **KB-01: Password Reset:** Self-service portal at any time. If locked out after >5 failed attempts, manual IT unlock without approval.
- **KB-02: VPN Access:** Granted automatically to full-time employees. Contractors require manager approval via the access request form. Credentials expire every 90 days and must be renewed by the employee.
- **KB-03: Laptop Replacement:** Eligible after 3 years of service or verified hardware failure. Requires at least 2 weeks advance notice.
- **Asset Management Policy (Extract):** Standard 4-year refresh cycle. Early replacement outside this cycle requires Finance sign-off in addition to IT approval.
- **KB-04: Software Installation:** Approved catalog is self-service. Non-catalog software requires IT Security review (takes 3–5 business days).
- **KB-05: Printer Troubleshooting:** Check print queue and restart spooler first. If persisting, requires printer asset tag to dispatch a technician.
- **KB-06: Email Mailbox Quota:** Default is 25GB; archive old mail. Quota increases beyond 25GB require manager approval and are capped at 50GB.
- **KB-07: Guest Wi-Fi:** 24-hour pass generated at front-desk kiosk. No IT ticket required.
- **KB-08: Expense Software Access:** Access is granted by Finance, not IT. IT can only troubleshoot login/credentials once account exists.
- **KB-09: Security Incident Reporting:** Suspected phishing, malware, or unauthorized access must be reported immediately to `security@veridian-corp.example` and **never forwarded** to colleagues.
- **KB-10: Work-From-Home Equipment:** Remote workers (>3 days/week) are eligible for one-time allowance (chair, monitor). Requires manager sign-off and Finance processing; IT only ships upon approval.

---

## 6. Project Structure

```
├── data/
│   ├── policies.json              # KB-01 to KB-10 and Asset Management Policy extract
│   ├── employee_requests.json     # 15 requests from Data Pack (REQ-01 to REQ-15)
│   └── tickets.json               # Historical ticket queue records (TK-1042 to TK-1051)
├── server/
│   └── policyEngine.ts            # Core grounding engine, deterministic rules, & Gemini integration
├── src/
│   ├── components/
│   │   ├── ArchitectureView.tsx   # Visual pipeline diagram, tech stack, and assignment info
│   │   ├── AuditLogsView.tsx      # Chronological audit trail table with detail modals
│   │   ├── DemoModeView.tsx       # 10 mandatory evaluation test cases with batch runner
│   │   ├── EmployeeRequestsView.tsx# Table of all 15 requests with [Process with Agent]
│   │   ├── Header.tsx             # Corporate IT header & telemetry badges
│   │   ├── KnowledgeBaseView.tsx  # Searchable/filterable cards for all 11 policy docs
│   │   ├── NewRequestView.tsx     # Main interactive portal with 8 result cards & follow-up UI
│   │   ├── PolicyDetailModal.tsx  # Modal showing exact policy text & key constraints
│   │   ├── Sidebar.tsx            # Navigation console
│   │   └── TicketQueueView.tsx    # Active cases vs closed historical precedent records
│   ├── data/
│   │   └── demoTestCases.ts       # 10 test definitions with expected decisions and rationale
│   ├── App.tsx                    # Root application component with state synchronization
│   ├── index.css                  # Tailwind CSS entrypoint
│   ├── main.tsx                   # React root mount
│   └── types.ts                   # Domain TypeScript interfaces and types
├── test/
│   └── agent.test.ts              # Automated test suite (33 assertions, 100% pass)
├── .env.example                   # Environment variable template
├── metadata.json                  # AI Studio application metadata
├── package.json                   # Dependencies, build, dev, and test scripts
├── server.ts                      # Express API server with Vite middleware integration
├── tsconfig.json                  # TypeScript compiler configuration
└── vite.config.ts                 # Vite bundler configuration
```

---

## 7. Environment Variables

Create a `.env` file in the root directory (or use AI Studio Secrets):

```env
# Required for Gemini AI generation. If omitted, the agent seamlessly
# falls back to the deterministic policy engine with 100% Data Pack compliance.
GEMINI_API_KEY="your-gemini-api-key"

# Host URL injected by Cloud Run / AI Studio
APP_URL="http://localhost:3000"
```

---

## 8. Setup & How to Run

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with Express and Vite middleware.

### Production Build & Launch
```bash
npm run build
npm start
```

### Running Automated Tests
```bash
npm test
```
Executes `tsx test/agent.test.ts` to test all 10 core scenarios, policy citations, and boundary conditions.

---

## 9. 10 Core Demo Scenarios (Mandatory Evaluation Checklist)

The application includes an interactive **Demo Mode** with 1-click test runners for each mandatory scenario:

1. **Password Lockout:** REQ-03 (>5 attempts) -> **RESOLVE** (Manual unlock per KB-01; no approval required).
2. **Guest Wi-Fi:** REQ-02 -> **RESOLVE** (24-hour self-service kiosk per KB-07; no ticket needed).
3. **VPN Credential Expiry:** REQ-05 -> **RESOLVE** (90-day renewal self-service per KB-02).
4. **Non-Catalog Software:** REQ-04 -> **ESCALATE** (Routed to IT Security review, 3–5 days per KB-04).
5. **Printer Paper Jam:** REQ-06 -> **FOLLOW_UP** (Queue check / spooler restart, request asset tag per KB-05).
6. **Phishing Email:** REQ-08 -> **ESCALATE** (Critical priority, route to `security@veridian-corp.example`, warn against forwarding per KB-09).
7. **WFH Monitor Request:** REQ-07 -> **RESOLVE** (>3 days/week eligible, manager sign-off + Finance processing per KB-10).
8. **Mailbox Full:** REQ-09 -> **RESOLVE** (Default 25GB quota, archive old emails per KB-06).
9. **Contractor VPN:** REQ-11 -> **RESOLVE** (Instructs manager to submit access request form per KB-02).
10. **Vague Request:** REQ-15 ("hey can you help, its not working") -> **FOLLOW_UP** (Prompts employee: "What isn't working? Laptop, VPN, Email, Printer, Software, Other").

---

## 10. Security & Grounding Considerations

- **No Public API Keys:** Gemini API keys are never bundled into client-side code; all requests flow through `/api/analyze` on Express.
- **Conservative Security Defaults:** Admin privilege requests (REQ-10) and security incidents (REQ-08) bypass general support and escalate to specialized security queues immediately.
- **Zero Hallucination Guarantee:** The agent will not approve unauthorized equipment, non-catalog software, or server root permissions simply because a user marks it "urgent". Precedent TK-1050 is cited when rejecting or escalating unapproved server access.
