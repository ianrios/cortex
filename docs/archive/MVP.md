# MVP Definition

## Problem Statement

Software engineers working across multiple sessions and projects experience constant context loss:

1. **Within a session:** Reasoning context is lost when closing the IDE
2. **Between sessions:** Critical decisions and architectural rationale must be reconstructed
3. **Across projects:** Similar problems are re-solved independently in different codebases
4. **Team scale:** Knowledge lives in individual heads, not queryable systems

This cognitive overhead is unavoidable in stateless systems (chatbots, search engines). Cortex solves it by treating memory and continuity as system primitives.

## Target User

**Primary persona:** Full-stack engineer (1–10 years experience) working on:
- Single or multi-repo projects
- Complex architectural decisions
- Multi-session work spanning days/weeks
- Teams where context transfer matters

**Not the target:** Hobbyist coders, pure code-gen workflows, single-session interactions

## MVP Goals

1. **Prove persistent memory is valuable** — Show that cross-session memory improves reasoning
2. **Establish agent-human collaboration** — Demonstrate inspectable agent reasoning in real workflows
3. **Create memory abstraction** — Build storage layer that can evolve (not locked to one DB choice)
4. **Support multi-session continuity** — Enable an engineer to context-switch across sessions/projects
5. **Make reasoning auditable** — All decisions and memory access are traceable

## MVP Non-Goals

- ❌ Full project automation
- ❌ Real-time team collaboration
- ❌ Vector-DB-based semantic search (optional post-MVP)
- ❌ Multi-agent orchestration or handoff
- ❌ Organizational/team-level memory
- ❌ Browser UI or cloud hosting
- ❌ High-throughput optimization
- ❌ Plugin ecosystem

## MVP Scope

### In Scope

**Memory System**
- Session memory (scoped to current terminal session)
- Intent memory (captured decisions and rationale)
- Decision log (structured record of choices made)
- Event log (auditable trace of actions)
- Per-project memory isolation

**Agent Capabilities**
- Read and reason about code/architecture
- Propose solutions with rationale
- Confirm actions before execution
- Update memory after decisions
- Query and retrieve prior decisions

**Execution Model**
- Tool invocation with approval gates
- Dangerous operation safety (require confirmation)
- Memory write after completion
- Error handling and failure logging

**Terminal Interface**
- Basic TUI navigation
- Slash commands for agent interaction
- Memory query and search
- Trace/log inspection
- Session management

**Safeguards**
- Approval required for:
  - File deletion
  - Git operations
  - System commands
  - Large code changes
- Audit logging of all approvals
- Ability to review what agent is about to do before execution

### Out of Scope

- Real-time collaboration
- Browser UI
- Cloud storage
- Semantic search (file-based exact match only)
- Multi-agent coordination
- Complex workflow orchestration
- Performance optimization
- Extensive error recovery

## MVP Workflows

### Workflow 1: Multi-Session Problem Solving

**Setup:**
Engineer closes IDE with a partially-solved architectural problem.

**Next day:**
1. Open Cortex, point to project
2. Agent retrieves:
   - Previous session context
   - Proposed solutions and their tradeoffs
   - Constraints that were discovered
3. Engineer and agent continue reasoning from where they left off
4. New decisions are added to memory
5. Solution is recorded with rationale

**Success Metric:** Engineer can context-switch between projects without losing reasoning.

### Workflow 2: Decision Documentation

**Setup:**
Engineer is about to make a significant architectural change.

**Flow:**
1. Describe the problem and constraints
2. Agent proposes 2-3 approaches with tradeoffs
3. Engineer selects one approach
4. Agent records:
   - Decision made
   - Alternatives considered
   - Rationale (why this one)
   - Constraints that shaped it
   - Expected outcomes
5. Later, when revisiting similar decisions, agent can retrieve and apply prior reasoning

**Success Metric:** Architectural rationale is captured and retrievable.

### Workflow 3: Cross-Project Context Transfer

**Setup:**
Engineer works on similar architectural problems in two different projects.

**Flow:**
1. In project A, design decisions are made and recorded
2. Weeks later, in project B, similar problem emerges
3. Agent retrieves analogous decisions from project A
4. Engineer can evaluate if prior rationale applies to project B
5. Can reuse, adapt, or consciously diverge with explicit reasoning

**Success Metric:** Lessons from one project inform another without manual transfer.

### Workflow 4: Reasoning Inspection and Debugging

**Setup:**
Engineer wants to understand why agent proposed a particular solution.

**Flow:**
1. Request trace of agent's reasoning
2. Cortex displays:
   - What memory was retrieved
   - What reasoning steps were taken
   - What constraints were considered
   - Where human input was requested
3. Engineer can question any step and see the full context

**Success Metric:** Agent reasoning is understandable and debuggable.

## Acceptance Criteria

### Functional
- [ ] Memory persists across terminal sessions (same project)
- [ ] Memory is retrievable by project and time range
- [ ] Agent can propose solutions with explicit tradeoff reasoning
- [ ] All agent actions require confirmation or approval
- [ ] Memory is recorded after approved actions
- [ ] Traces show complete reasoning path
- [ ] Project-level memory isolation works correctly
- [ ] Engine works with Go as primary implementation

### Non-Functional
- [ ] All dangerous operations have explicit approval gates
- [ ] Memory is queryable (at least by project/date/tags)
- [ ] No single points of failure (data loss due to bugs)
- [ ] Traces are human-readable (not opaque)
- [ ] System works offline

### User Experience
- [ ] Terminal interface is navigable without learning complex commands
- [ ] Memory retrieval is fast enough for interactive use
- [ ] Error messages are clear and actionable
- [ ] Approval prompts are clear and hard to miss

## Assumptions

### Explicit Assumptions

**Storage:** MVP can use a simple abstraction that later becomes pluggable. Initial implementation TBD (SQLite, Postgres, file-based, or hybrid).

**LLM Provider:** MVP supports Claude via Anthropic SDK. Provider switching support is deferred.

**Memory Retrieval:** MVP uses exact-match and time-based queries. Semantic search (embeddings) is deferred post-MVP.

**Concurrency:** MVP assumes single-user, single-machine. Multi-user scenarios are future work.

**Performance:** MVP prioritizes correctness and inspectability over throughput.

### Inherited from Bootstrap

See [../bootstrap/decisions.md](../bootstrap/decisions.md) for confirmed constraints.

## Open Questions (MVP Scope)

1. **Memory representation** — How are decisions structured (event vs DAG vs documents)?
2. **Retrieval model** — For MVP, is file-based exact match sufficient, or do we need DB queries?
3. **Storage layer** — What is the minimal storage abstraction for MVP?
4. **Task vs Session semantics** — Are these the same thing, or distinct concepts?
5. **Session lifecycle** — What defines session boundaries (terminal session, explicit mark, time-based)?

See [../bootstrap/open_questions.md](../bootstrap/open_questions.md) for full list.

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Memory becomes unreliable | Loses user trust | Audit logging, trace everything, human approval required |
| Storage abstraction is too loose | Locks in bad design | Start simple, document assumptions, plan for evolution |
| Agent reasoning is opaque | Can't debug or trust it | All traces are human-readable, require explicit approvals |
| Performance degrades with session size | Becomes unusable | Profile early, optimize critical paths, not all paths |
| LLM provider lock-in | System depends on single provider | Design with abstraction from start, plan switching |

## Success Metrics

### By end of MVP:
- MVP is usable for real engineering workflows
- Memory system proves valuable (users consciously rely on it)
- Reasoning is inspectable and trustworthy
- No data loss due to bugs
- Storage abstraction is proven (can swap implementations)

---

## Next Phases (Post-MVP)

### V1.0
- Multi-project memory queries
- Semantic search (optional embeddings)
- Architectural pattern library from decisions
- Team memory (shared context)

### V2.0+
- Multi-agent orchestration
- Organizational memory
- Complex workflow support
- Real-time collaboration

---

See [ROADMAP.md](ROADMAP.md) for longer-term planning.
