# Cortex Project Notes

Running log of decisions, findings, and unresolved questions.

**Last Updated:** 2026-05-21

---

## Session: Bootstrap Scaffolding (2026-05-21)

### Confirmed System Constraints (from bootstrap/)

✓ Project: Cortex (engineering cognition runtime, not toy/demo)
✓ Interface: Terminal-first TUI
✓ Philosophy: Local-first, human-in-the-loop, inspectable, model-agnostic
✓ MVP Language: Go
✓ Memory: Core system primitive, multi-layered, captures intent + decisions + rationale
✓ Sessions: Conceptually required for multi-session architecture
✓ Storage: Abstract layer (not locked to Postgres or file-only)
✓ Embeddings: Optional tooling, not core requirement
✓ Safety: Dangerous ops require approval by default

### Truly Open Questions (from open_questions.md)

These will be explicitly preserved in docs, not resolved:

1. **Memory Architecture**
   - Final structure of intent memory?
   - Decision representation: event vs graph vs hybrid?
   - Event-sourced system from day 1?

2. **Retrieval Strategy**
   - Semantic (embeddings) vs structured queries vs both?
   - Embeddings at MVP or deferred?
   - Preventing contradictory memory retrieval?

3. **Storage Layer**
   - Abstract storage interface design?
   - What goes filesystem vs DB?
   - Graph capabilities needed early?

4. **Agent Execution Model**
   - Request → Plan → Execution → State update flow?
   - Multi-session memory isolation/sharing?
   - Handoff between agents/sessions?
   - Task/session/workflow taxonomy?

5. **CLI/TUI Model**
   - Minimal viable terminal interface?
   - Human ↔ Agent command parity?

6. **Event Model**
   - Core event types to capture?
   - Replay/debugging via event log?
   - Event → Memory derivation?

---

## Scaffolding Plan

Creating /docs structure now with:
- Decisions anchored to bootstrap constraints
- Open questions explicitly labeled
- Hypotheses clearly marked "not finalized"
- No hidden assumptions

---

## Scaffolding Complete (2026-05-21)

### Files Created

**Root Documentation:**
- ✓ README.md — Project overview, philosophy, non-goals
- ✓ VISION.md — Long-term goals, engineering cognition concept
- ✓ PRINCIPLES.md — 12 core design principles with tensions
- ✓ MVP.md — Full product/RFC-style definition with workflows
- ✓ ROADMAP.md — Phased planning from MVP through v2.0+

**Architecture & Design:**
- ✓ SYSTEM_ARCHITECTURE.md — High-level conceptual layers (6 components)
- ✓ MEMORY_ARCHITECTURE.md — 6 memory types, taxonomy, consolidation
- ✓ AGENT_SPEC.md — Agent role, permissions, lifecycle, collaboration model
- ✓ EVENT_MODEL.md — Event sourcing, event types, replay/debugging
- ✓ CLI_DESIGN.md — Terminal interface, commands, approval flows

**Process & Collaboration:**
- ✓ CONTRIBUTING.md — Architecture-first culture, RFC mentality, ADR usage

### Directory Structure

```
/docs/
  ├── adr/              (for Architecture Decision Records)
  ├── architecture/     (for deeper architecture docs)
  ├── memory/           (for memory system docs)
  ├── product/          (for product specs)
  └── research/         (for research and exploration)
/bootstrap/           (SYSTEM STATE, not documentation)
  ├── vision_seed.md
  ├── decisions.md
  ├── open_questions.md
  ├── architecture_hypotheses.md
  └── terminology.md
```

### Design Decisions Made (During Scaffolding)

1. **Memory is multi-layered:** 6 types (session, intent, decision, event, semantic, organizational)
2. **Events are immutable:** Events are primary record, memory derives from them
3. **Safety is explicit:** Dangerous ops require approval, humans and agents have parity
4. **Storage is abstracted:** No single DB choice locks design
5. **Agent is collaborative:** Proposes and explains, humans decide
6. **Inspectability is required:** All reasoning and execution is traceable
7. **Sessions are bounded:** Scoped execution + interaction context (details TBD)
8. **Embeddings are optional:** Semantic search is post-MVP capability
9. **Go is MVP language:** Implementation language (confirmed from bootstrap)

---

## True Open Questions (Unresolved, Explicitly Preserved in Docs)

These are the genuine architectural unknowns that will shape MVP and beyond:

### 1. Memory Representation & Storage

**Question:** How are decisions and intent actually structured in memory?

**Sub-questions:**
- Decision records: should they be flat (single record) or hierarchical (clusters)?
- Intent capture: how do we make intent-capture not too rigid but not too free-form?
- Storage abstraction: what's the minimal interface that lets us swap implementations?
- Graph vs relational: do we need graph relationships for decisions?

**Why it matters:** This shapes storage layer design, retrieval efficiency, and memory queries.

**Docs:** MEMORY_ARCHITECTURE.md, SYSTEM_ARCHITECTURE.md

---

### 2. Event Sourcing Scope

**Question:** Is event sourcing fundamental from MVP day 1, or can we add it later?

**Sub-questions:**
- What's the minimum event set for MVP? (just DecisionEvents? or include execution?)
- Can we migrate to event sourcing retroactively?
- How much of the event log do we keep vs prune?
- Event granularity: one event per file write, or per tool invocation?

**Why it matters:** This affects audit trail completeness, replay capability, debugging.

**Docs:** EVENT_MODEL.md, MEMORY_ARCHITECTURE.md

---

### 3. Session Model & Boundaries

**Question:** What defines a session? How do multiple sessions interact?

**Sub-questions:**
- Is a session = terminal session? Or something else?
- Can two sessions write to same project memory concurrently?
- How is session context persisted? (database, file, memory?)
- Session lifecycle: when are they archived?
- Can a human pause, context-switch, and resume?

**Why it matters:** This shapes agent-human interaction, memory isolation, state management.

**Docs:** AGENT_SPEC.md, SYSTEM_ARCHITECTURE.md, /bootstrap/open_questions.md

---

### 4. Retrieval Strategy

**Question:** When do we use exact match vs semantic similarity vs structured queries?

**Sub-questions:**
- MVP: file-based exact match sufficient, or do we need DB?
- Post-MVP: are embeddings necessary at that stage?
- How do we prevent contradictory memory from both being retrieved?
- Hybrid retrieval: what's the right balance?

**Why it matters:** This shapes memory query interface, storage requirements, search experience.

**Docs:** MEMORY_ARCHITECTURE.md, MVP.md

---

### 5. Agent Execution Model Detail

**Question:** How exactly does request → plan → execution → memory-write flow work?

**Sub-questions:**
- Are plan steps sequential or can they be parallel?
- If agent hits a blocker, what's the fallback? (escalate, retry, adjust plan?)
- How does agent learn from failures? (updates to intent memory?)
- Multi-turn conversations: how does context carry forward?

**Why it matters:** This shapes agent runtime, reasoning quality, error handling.

**Docs:** AGENT_SPEC.md, SYSTEM_ARCHITECTURE.md

---

### 6. Approval & Safety Gate Details

**Question:** What exact operations require approval? How do users configure thresholds?

**Sub-questions:**
- MVP: is everything requiring approval, or only specific high-risk ops?
- Can users whitelist/blacklist actions?
- Approval timeout: if human doesn't respond, what happens?
- Emergency abort: can user stop agent mid-execution?

**Why it matters:** This shapes user trust, operational safety, human-AI workflow.

**Docs:** AGENT_SPEC.md, CLI_DESIGN.md, PRINCIPLES.md

---

### 7. Storage Layer Implementation

**Question:** What's the first concrete storage implementation?

**Sub-questions:**
- Postgres? SQLite? File-based? Hybrid?
- Schema design: relational? document? graph?
- Indexing strategy: what queries must be fast?
- Migration path: can schema evolve over time?

**Why it matters:** This is the first real implementation decision.

**Docs:** SYSTEM_ARCHITECTURE.md, MVP.md

---

### 8. LLM Provider Abstraction

**Question:** How do we make provider-agnostic without over-engineering?

**Sub-questions:**
- MVP: Claude only, design for abstraction?
- Interface: what must be abstracted vs what can be provider-specific?
- Cost and rate limiting: how do we handle provider-specific constraints?
- Fallback: what if Claude API is down?

**Why it matters:** This shapes integration layer, prevents lock-in.

**Docs:** SYSTEM_ARCHITECTURE.md, PRINCIPLES.md

---

### 9. Memory Consolidation & Evolution

**Question:** How does memory get refined and consolidated over time?

**Sub-questions:**
- When consolidation happens: periodic, on-demand, triggered?
- What form does it take: new memory records? summary events?
- Can we revise memory when we learn a decision was wrong?
- How do we prevent contradictions?

**Why it matters:** This shapes long-term memory quality and system growth.

**Docs:** MEMORY_ARCHITECTURE.md, EVENT_MODEL.md

---

### 10. Tool Execution Interface

**Question:** What's the contract between agent and tools?

**Sub-questions:**
- Sync or async? Streaming output or final result?
- How does agent get feedback during execution?
- Error handling: what does tool return on failure?
- Tool registration: how are tools discovered and versioned?

**Why it matters:** This shapes agent-tool integration, execution model.

**Docs:** SYSTEM_ARCHITECTURE.md, AGENT_SPEC.md

---

## Recommended Next Architecture Discussions

### Priority 1 (MVP-Critical)

1. **Session Model & Boundaries**
   - Needed for: understanding human-agent interaction in MVP
   - Discussion output: formal definition of "session"
   - Decision needed by: before agent runtime design

2. **Storage Layer Implementation**
   - Needed for: first code write on memory system
   - Discussion output: storage abstraction interface + initial implementation choice
   - Decision needed by: start of MVP implementation

3. **Event Sourcing Scope**
   - Needed for: understanding audit trail requirements
   - Discussion output: minimal event set for MVP
   - Decision needed by: start of event log implementation

### Priority 2 (Shapes MVP Design)

4. **Agent Execution Model Detail**
   - Needed for: understanding request/response flow
   - Discussion output: concrete flow diagram + error handling strategy
   - Decision needed by: agent runtime design

5. **Approval & Safety Gates Detail**
   - Needed for: MVP safety design
   - Discussion output: MVP approval gates list + user configuration scope
   - Decision needed by: approval system implementation

6. **Memory Representation**
   - Needed for: storage schema design
   - Discussion output: decision record structure + intent field definitions
   - Decision needed by: storage schema design

### Priority 3 (Post-MVP Planning)

7. **Memory Consolidation Strategy**
8. **LLM Provider Abstraction Design**
9. **Tool Execution Interface**
10. **Retrieval Strategy Refinement**

---

## Notes for Next Session

When returning to this project:
1. Read NOTES.md (this file) for context
2. Check /bootstrap/ for system state
3. Review /docs/ for current design
4. Pick highest-priority open question
5. Write RFC in GitHub issue or docs/adr/
6. Drive discussion, then implement

The architecture is intentionally not finalized. It's designed for evolution.
