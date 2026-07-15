# Event Model and Event Sourcing

Events as the primary record of Cortex behavior: decisions, approvals, executions, and memory updates.

## Core Concept

Events are **immutable, semantic records of meaningful actions and decisions**.

Events form the audit trail. Everything else (memory, decisions, patterns) is derived from events.

```
Events (immutable log)
  ↓
Memory (derived, searchable)
  ↓
Reasoning (informed by memory)
  ↓
New events (creating new history)
```

---

## Why Event Sourcing Matters for Cortex

### Auditability

Every decision, approval, and action is recorded with:
- What happened
- When it happened
- Who made it or approved it
- Full context

### Replay and Debugging

From the event log, we can reconstruct:
- The exact state at any point in time
- Why a decision was made (trace backward through events)
- What reasoning led to an action
- How memory influenced a decision

### Memory Derivation

Event log is the source of truth. Memory is computed from events:
- Decision memory: extract DecisionEvents
- Intent memory: extract DecisionEvents + human annotations
- Organizational patterns: aggregate DecisionEvents across projects

### Consistency and Contradiction Detection

With the full event history, we can:
- Detect contradictory decisions
- Identify when we learn something was wrong
- Track decision evolution over time

### Compliance and Governance

Complete audit trail for:
- Who approved what decisions
- When approvals were given
- What context informed them

---

## Event Types (Tentative)

Events are semantic (not raw logs). Each event type captures specific meaning.

### DecisionEvent

**When:** Agent or human proposes and records a decision.

```
DecisionEvent:
  event_id: UUID
  timestamp: ISO8601
  project_id: string
  decision_id: string (unique within project)
  
  subject: string ("Use PostgreSQL instead of NoSQL")
  alternatives: [
    {
      name: string
      rejected_because: string
    }
  ]
  
  constraints: [string] ("Must support ACID transactions", ...)
  rationale: string (why this decision was made)
  tradeoffs: string (what we're giving up)
  risks: [
    {
      risk: string
      mitigation: string
    }
  ]
  
  decided_by: "human" | "agent"
  agent_reasoning: string (only if decided_by == "agent")
  source_session_id: string
  
  status: "proposed" | "approved" | "rejected"
```

### ApprovalEvent

**When:** Human approves or rejects a decision or action.

```
ApprovalEvent:
  event_id: UUID
  timestamp: ISO8601
  project_id: string
  
  reference_id: string (decision_id or action_id)
  reference_type: "decision" | "action" | "execution"
  
  approved: boolean
  approver: string (user identifier)
  reason: string (why they approved/rejected)
  context_shown: string (what was displayed to approver)
```

### ExecutionEvent

**When:** A tool is invoked and completes.

```
ExecutionEvent:
  event_id: UUID
  timestamp: ISO8601
  project_id: string
  session_id: string
  
  tool_name: string ("git_commit", "file_write", "code_analysis")
  tool_version: string
  
  parameters: object (what was passed to tool)
  approval_required: boolean
  approval_event_id: string (if approved)
  
  output: object (result of tool execution)
  status: "success" | "failure" | "partial"
  error_message: string (if failed)
  
  duration_ms: integer
  resource_usage: object (memory, CPU, disk, etc. - optional)
  
  initiated_by: "agent" | "human"
  agent_reasoning: string (if agent initiated)
```

### FailureEvent

**When:** Something goes wrong and we need to record it with context.

```
FailureEvent:
  event_id: UUID
  timestamp: ISO8601
  project_id: string
  session_id: string
  
  failed_action: string (what was being attempted)
  failure_type: string ("execution_error", "validation_error", "approval_denied")
  error_message: string
  error_context: object (full context for debugging)
  
  recovery_action: string (what was done to recover)
  recovery_required_approval: boolean
  recovery_approval_event_id: string (if approved)
  
  severity: "warning" | "error" | "critical"
```

### MemoryEvent

**When:** Memory is written, updated, or consolidated.

```
MemoryEvent:
  event_id: UUID
  timestamp: ISO8601
  project_id: string
  
  operation: "write" | "update" | "consolidate" | "validate"
  memory_type: "session" | "intent" | "decision" | "semantic" | "organizational"
  memory_id: string
  
  content: object (what was written)
  source_event_id: string (what triggered this memory write)
  
  written_by: "agent" | "human" | "system"
  rationale: string (why this memory was written)
```

### SessionEvent

**When:** Session lifecycle events occur.

```
SessionEvent:
  event_id: UUID
  timestamp: ISO8601
  
  session_id: string
  project_id: string
  
  event_type: "session_started" | "session_paused" | "session_resumed" | "session_ended"
  user: string
  
  context: object
    - codebase_state: string (git commit hash, etc.)
    - focus_area: string (what was being worked on)
    - open_questions: [string]
```

### ContradictionDetectedEvent

**When:** System detects contradictory decisions or invalidated assumptions.

```
ContradictionDetectedEvent:
  event_id: UUID
  timestamp: ISO8601
  project_id: string
  
  contradiction_type: "direct_contradiction" | "assumption_invalidated" | "learning_update"
  
  involved_decisions: [string] (decision IDs involved)
  contradiction_description: string
  
  suggested_resolution: string
  requires_human_decision: boolean
```

---

## Event Semantics

### Ordering

Events are **causally ordered** (happen in logical sequence), not just chronologically ordered.

Example:
1. DecisionEvent (decision made)
2. ApprovalEvent (approved)
3. ExecutionEvent (decision executed)
4. MemoryEvent (decision recorded in memory)

Causal order matters for understanding why something happened.

### Immutability

Events are **append-only**. They are never deleted or modified.

If a decision is revised, a new DecisionEvent is created that references the prior one.

### Completeness

Each event contains **all context needed to understand it** without looking up other records.

Example: ApprovalEvent includes what was approved (not just ID), so you don't need to join with DecisionEvent to understand what was approved.

---

## Event Replay and Reconstruction

### Replay Scenarios

**Scenario 1: Understand Why a Decision Was Made**

```
Start: Current decision in question
Query: What events led to this decision?
  → DecisionEvent created by agent
  → What memory was retrieved? MemoryEvents
  → What prior decisions influenced this? References to other DecisionEvents
  → What approval context was shown? ApprovalEvent
Result: Full lineage and reasoning
```

**Scenario 2: Debug an Agent Action**

```
Start: Agent proposed something unexpected
Query: What was the agent reasoning?
  → Retrieve ExecutionEvent(s) for the action
  → Retrieve MemoryEvents that were retrieved
  → Retrieve DecisionEvent(s) that informed it
  → Show agent reasoning from events
Result: Understand why agent chose this path
```

**Scenario 3: Analyze Project Evolution**

```
Start: Project timeline
Query: What major decisions shaped this project?
  → Filter DecisionEvents by date range
  → Group by architectural area
  → Show alternative paths not taken
Result: Architectural history and reasoning
```

### Event Query Interface (Tentative)

```
GetEvents(project, type, date_range) → [events]
GetEventChain(event_id) → [causally_related_events]
GetEventsByDecision(decision_id) → [all events related to this decision]
ReplayToState(project, timestamp) → project state as of that time
```

---

## Event Consolidation (Post-MVP)

**Problem:** Event log grows unbounded. Queries slow down.

**Solution (Conceptual):** Periodically consolidate events into higher-level memory.

```
Events (100 architecture decisions over 2 years)
  ↓ [consolidation]
  ↓
Patterns (3 major architectural approaches, with tradeoffs)
  ↓
Memory (captured patterns become reusable)
```

**Questions:**
- When consolidation happens? (periodic, on-demand, triggered by size?)
- What's the output? (new memory records, summary events, both?)
- How do we preserve original reasoning while consolidating?

---

## Unresolved Event Design Questions

1. **Event granularity:** Should "write file" be one event or multiple (one per file)?

2. **Agent reasoning capture:** How much detail from agent's chain-of-thought should be in events? (Full transcript? Summary? Structured reasoning?)

3. **Event storage format:** How are events serialized and stored? (JSON, protobuf, custom binary?)

4. **Event compression:** Do we compress old events? Can we still replay if compressed?

5. **Cross-project events:** Should we track events that involve multiple projects? How?

6. **Sensitive data:** If an event captures code or config, how do we handle privacy/security?

---

## Event-Driven Memory Architecture

See [MEMORY_ARCHITECTURE.md](MEMORY_ARCHITECTURE.md) for how memory derives from events.

---

## Compliance and Auditability

Event sourcing enables:

✓ Complete audit trail (every decision, approval, action)  
✓ Compliance reporting (what was approved, when, by whom)  
✓ Incident investigation (what happened and why)  
✓ Performance analysis (which tools are used, how often)  
✓ Pattern recognition (what decisions are common, what's unique)  

---

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for event log's role in overall system.

See [../bootstrap/open_questions.md](../bootstrap/open_questions.md) for unresolved questions.
