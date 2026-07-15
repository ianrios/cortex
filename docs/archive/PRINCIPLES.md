# Design Principles

Core principles guiding Cortex architecture and implementation decisions.

## 1. Local-First

**Cortex must be deployable and operable entirely locally.**

- All data is owned by the user
- No cloud dependency or vendor lock-in
- Per-project memory scope
- Works offline (if applicable to use case)
- User controls all backups and migrations

## 2. Human-in-the-Loop

**Critical decisions require human approval. Agents augment, not replace.**

- Dangerous operations (file deletion, git operations, migrations) require explicit approval
- High-risk decisions default to requiring human input
- Humans can configure approval thresholds
- System logs all decisions and their approval status
- Reversibility is a first-class concern

## 3. Inspectable Reasoning

**All agent thinking and decisions must be auditable and reproducible.**

- Every agent action is traced and logged
- Reasoning steps are captured and queryable
- Memory access is logged (what was retrieved, when, why)
- Failures include full context for debugging
- Traces are human-readable, not opaque vectors

## 4. Persistent Cognition

**Memory is a system primitive, not an optional feature.**

- Multi-layered memory (intent, decision, event, session)
- Memory persists across sessions and projects
- Memory is versioned and evolvable
- Memory includes architectural rationale and tradeoff analysis
- Memory is searchable and contextual

## 5. Model-Agnostic Design

**Cortex must support multiple LLM providers without architectural change.**

- No single-provider lock-in
- Abstraction over LLM provider selection
- Support for switching providers without system redesign
- Interface definitions allow future provider expansion
- Model-specific capabilities are optional, not required

## 6. Event-Driven Memory

**System history is first-class; memory is derived from events.**

- Core events (decisions, approvals, executions) are captured immutably
- Memory consolidation is an explicit process
- Event replay enables reasoning reconstruction and debugging
- Chronological and semantic search complement each other
- Events form an audit trail

## 7. Explicit Assumptions

**No silent architectural decisions. Constraints are stated.**

- Open questions are documented, not hidden
- Design hypotheses are clearly marked
- Deferred decisions are tracked
- Assumptions are listed per feature/component
- Architecture decisions are recorded in ADRs

## 8. Tool Parity

**Humans and agents have access to similar capabilities.**

- Agents use the same tools humans can use
- Tool access is permission-based for both
- Agents can't do things humans can't do
- Visibility into what tools are available is shared
- Approval gates are consistent

## 9. Continuity Over Statelessness

**Reject the stateless query model. Embrace session and project context.**

- Agents maintain awareness of conversation and project history
- Session context threads multiple interactions together
- Project understanding accumulates over time
- Related work can be discovered and reused
- Previous decisions inform future reasoning

## 10. Architectural Clarity

**System boundaries and component relationships are explicit.**

- Memory, agent, execution, and inspection systems are conceptually distinct
- Interfaces between components are defined
- Each component has clear responsibilities
- Cross-cutting concerns (logging, tracing, safety) are systematic
- Abstraction layers protect against implementation churn

## 11. Inspectability Over Performance

**When there's a tradeoff, make the system understandable over fast.**

- Detailed logs matter more than performance optimization
- Queryable traces matter more than raw throughput
- Human understanding is prioritized over micro-optimizations
- Debuggability is designed in from the start
- Performance work comes after clarity is achieved

## 12. Incremental Capability

**Start minimal, expand with evidence, not speculation.**

- MVP includes only essential features
- Each capability is justified by real workflow need
- Speculative features are deferred
- Architecture supports future expansion without redesign
- Simplicity is preserved as long as possible

---

## Principle Tensions and Resolutions

### Inspectability vs Performance
- **Resolution:** Prefer detailed traces. Optimize later.

### Model-Agnostic vs Optimal
- **Resolution:** Support multiple providers. Don't design around LLM quirks.

### Local-First vs Collaboration
- **Resolution:** MVP is local-only. Collaboration is post-v1.0.

### Human-in-Loop vs Autonomy
- **Resolution:** Default to requiring approval. Users configure thresholds.

### Persistent Memory vs Storage Simplicity
- **Resolution:** Memory abstraction allows storage implementation to evolve.

---

See [VISION.md](VISION.md) for context on why these principles matter.
