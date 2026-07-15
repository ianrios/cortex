# CLI/TUI Design

Terminal interface and interaction model for Cortex.

## Philosophy

- **Terminal-first:** Native to engineering workflows
- **Inspectable:** See what's happening, not hidden behind UI
- **Command-driven:** Familiar paradigm (slash commands)
- **Session-aware:** Context persists across commands
- **Human-paced:** Not AI magic, clear input/output

---

## Interaction Model

### Session Lifecycle

```bash
$ cortex init /path/to/project
  → Project loaded, memory initialized
  → Agent ready

$ cortex session
  → List recent sessions, pick one to resume or create new

$ cortex
  → Resume last session

$ cortex --project /path/to/other-project
  → Switch to different project

$ exit
  → Session archived, memory consolidated
```

### Command Categories

**Navigation:**
```
/project [path]        - Switch project
/session [id]          - Switch or list sessions
/memory                - Browse memory
/trace [id]            - Inspect reasoning trace
/help                  - Show commands
```

**Agent Interaction:**
```
/ask [query]           - Ask agent a question
/analyze [path]        - Analyze code/architecture
/decide [description]  - Document a decision
/review [path]         - Request code review with reasoning
/next                  - Get agent's suggestion for next step
```

**Approval/Execution:**
```
/approve               - Approve pending action
/reject                - Reject pending action
/review-first          - Show me what you're about to do
/undo [action]         - Undo recent action (if reversible)
```

**Memory:**
```
/memory query [term]   - Search memory
/memory show [id]      - Show specific memory record
/memory related [id]   - Show related decisions
/memory contradictions - Find contradictory decisions
```

**Inspection:**
```
/trace [id]            - Show reasoning trace
/events [date-range]   - Show events in time range
/log [--agent]         - Show session log (optional: agent only)
/explain [id]          - Explain a decision
```

---

## TUI Layout (Conceptual)

```
┌─────────────────────────────────────────────────────┐
│ Cortex: project-name [session-123]                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Agent: Let me analyze this module structure...     │
│  [retrieving memory from 3 prior refactors]         │
│                                                      │
│  I found similar work 6 months ago with lessons:    │
│  - Batch size of 5000 was too large                 │
│  - Incremental migration reduced risk               │
│                                                      │
│  Proposal:                                           │
│  1. Extract interface from MongoService              │
│  2. Implement PostgreSQL adapter                     │
│  3. Migrate in 1000-row batches                      │
│                                                      │
│  Risks: Schema mismatch during migration             │
│  Mitigation: Run validation queries                  │
│                                                      │
│ [APPROVE] [REVIEW FIRST] [REJECT] [ASK QUESTION]   │
│                                                      │
├─────────────────────────────────────────────────────┤
│ /ask /decide /memory /trace /help > _               │
└─────────────────────────────────────────────────────┘
```

---

## Approval Prompts

Clear, specific, reviewable.

```
ACTION: Create database migration (add nullable column to users.phone)

What this does:
  - Creates migration: migrations/001_add_phone_column.sql
  - Adds column with DEFAULT NULL
  - No data is modified

Risks:
  - Migration locks 'users' table during DDL
  - Heavy queries during migration could timeout

Mitigation:
  - Using WITH (LOCK_TIMEOUT = 5 minutes)
  - Migration runs in low-traffic window (suggested: 2am UTC)

Memory context:
  - 3 similar migrations in history
  - Latest lesson: batch size > 5000 caused issues
  - Recommended: lock timeout + batching

[APPROVE] [REVIEW CODE] [POSTPONE] [ALTERNATIVE?]
```

---

## Memory Browsing

```
/memory related architecture.database

Related decisions:
  ✓ [2024-09-15] Use PostgreSQL (approved)
  ✓ [2024-08-20] Multi-tenant database design (approved)
  ✗ [2024-07-10] Use NoSQL (rejected)
  ? [2024-06-05] Cache layer strategy (open)

Show: [1] [2] [3] [4] or /memory show [id]
```

---

## Trace Inspection

```
/trace decision-123

Decision: Use PostgreSQL instead of NoSQL

Memory retrieved:
  - Prior decision: MongoDB experiment (2023)
  - Outcome: Poor ACID support, switched away
  - Lesson: "Type safety matters for our use case"

Reasoning:
  1. Constraint: Must support transactions
  2. Constraint: Team prefers type safety
  3. Query memory: What worked before?
  4. Retrieved: MongoDB lesson learned
  5. Analysis: PostgreSQL satisfies all constraints
  6. Proposal: PostgreSQL

Approval context shown:
  - 2 alternatives considered
  - 1 prior relevant decision
  - 3 key risks identified

Approved by: [user] at [timestamp]
Outcome: [pending|executed|rolled back]
```

---

## Search and Query

```
/memory query "microservices"

Results:
  [1] Decision (2023-11-20): Monolith vs Microservices
      Status: APPROVED, Chose: Monolith
      Reasoning: Team size < 10, complexity overhead not justified

  [2] Intent (2023-10-15): Why we use monolith
      References: Deployment simplicity, shared database

  [3] Event (2024-01-05): Microservices discussion raised again
      Status: DISCUSSED, Decided: Revisit in Q3

  [4] Pattern: Monolith for 2-3 developer teams

Refine: /memory query "microservices" --tag=architecture
        /memory show [id]
        /memory related [id]
```

---

## Session Management

```
/session

Active sessions:
  [1] project-a (running, 2h 14m ago)
  [2] project-b (closed, 1 day ago)

Recent work:
  - Working on database schema refactor (project-a)
  - Debating service boundaries (project-b)

Resume: /session 1
New:    /session --new
Switch: /project /path/to/project

Session summary:
  - 4 decisions documented
  - 2 approvals given
  - 3 tools executed
```

---

## Error Handling

```
Agent: Attempting to delete migrations/ directory...

⚠️  APPROVAL REQUIRED

This operation is irreversible:
  - Would delete 47 files
  - Cannot be recovered from trash

Are you SURE? Type 'yes, delete migrations' to confirm
Or: [Cancel] [Propose Alternative] [Review Files First]

> _
```

---

## Inspection Commands

```
/log

[14:23:15] Agent: Analyzing codebase...
[14:23:18] → Retrieved 12 prior decisions from memory
[14:23:19] → Found 3 relevant patterns
[14:23:45] Agent: Completed analysis, proposing solution
[14:23:50] Human: Approved
[14:23:51] Agent: Executing plan step 1...
[14:24:02] → Tool: git_commit [SUCCESS]
[14:24:03] Agent: Executing plan step 2...
[14:24:15] → Tool: file_write [PENDING APPROVAL]

Current action:
  Write 143 lines to src/database/connection.ts
  [APPROVE] [REVIEW] [REJECT]

/trace [id]        - See full reasoning for any step
/events [filter]   - Show events in this session
/memory [term]     - Search memory used in this session
```

---

## Unresolved UI Questions

1. **Real-time output:** Does agent output stream, or appear all at once?
2. **Concurrent windows:** Can user inspect memory while agent is thinking?
3. **Long reasoning:** How do we handle agent traces that are very long?
4. **Mobile/SSH:** Does TUI work well over SSH with lag?
5. **Accessibility:** Keyboard-only navigation (no mouse)?

---

## Design Principles (for CLI/TUI)

✓ Inspectable — see what's happening  
✓ Reviewable — understand before approving  
✓ Reversible — can undo/cancel most actions  
✓ Familiar — slash commands are standard  
✓ Paced — not rushing, awaiting input  
✓ Clear — no hidden state or assumptions  

---

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for TUI's role in system.

See [AGENT_SPEC.md](AGENT_SPEC.md) for approval flows.
