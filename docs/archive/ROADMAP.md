# Roadmap

Long-term phasing for Cortex from MVP through v2.0+.

## Phase 0: MVP (Current)

**Goal:** Prove persistent memory and collaborative agent reasoning in single-project, single-user context.

**Key Milestones:**
- Memory primitives working (session, intent, decision, event)
- Terminal interface functional
- Human-agent collaboration on real workflows
- Reasoning fully inspectable

**Estimated:** 3-6 months

**Success Criteria:**
- Users actively rely on memory across sessions
- No data loss from bugs
- Storage abstraction can support alternative implementations

---

## Phase 1: Expanded Memory and Discovery (v1.0)

**Goal:** Make memory queryable across projects and create architectural continuity.

**Key Features:**

### Cross-Project Memory
- Memory queries span multiple projects
- Similar decisions across projects can be discovered
- Lessons from one project can inform another
- Project-level context is preserved but searchable

### Semantic Memory Querying (Optional)
- Embeddings become optional (not required for basic operation)
- Semantic similarity finds analogous decisions
- Hybrid retrieval: exact match + semantic similarity
- Can be disabled if preferred (local-first)

### Architectural Pattern Library
- Patterns emerge from decision history
- System can suggest proven approaches from past projects
- Patterns are tagged with project context and constraints
- Patterns can be explicitly marked for reuse

### Team Memory Foundation
- Memory can be marked as "shareable"
- Multiple users can query shared patterns
- Shared memory is read-only in MVP (write happens at individual level)
- Privacy boundaries are explicit (per-project, per-team, personal)

### Enhanced Querying
- Time range queries
- Tag-based search
- Multi-project analysis
- Memory consolidation across sessions
- Conflict detection (contradictory decisions)

**Estimated:** 3-4 months post-MVP

**Open Questions:**
- Embedding model selection (if used)
- Cross-project privacy boundaries
- Shared memory consistency model

---

## Phase 2: Multi-Session Workflow Orchestration (v1.5)

**Goal:** Support complex workflows that span multiple sessions and agent interactions.

**Key Features:**

### Explicit Task Model
- Tasks are first-class (not just implicit in conversation)
- Tasks can span multiple sessions
- Task graph shows dependencies
- Agents can hand off work between sessions
- Progress is tracked and resumable

### Session Handoff
- Agent can mark work as incomplete and ready for handoff
- Next session can pick up work with full context
- Handoff includes memory, current state, and blockers

### Workflow Templates
- Common workflow patterns become reusable templates
- Templates encode decision points and approval gates
- Can be customized per project

### Parallel Sessions
- Same project can be worked on in multiple sessions
- Conflict detection when modifications overlap
- Merge or sequential ordering of changes

**Estimated:** 2-3 months post-v1.0

**Dependencies:**
- v1.0 memory querying must be solid
- Task model must be decided

---

## Phase 3: Multi-Agent Coordination (v2.0)

**Goal:** Enable sophisticated workflows with multiple agents and human orchestration.

**Key Features:**

### Multi-Agent Runtime
- Multiple agents can run concurrently
- Shared memory with consistency guarantees
- Agent communication and state passing
- Request routing to appropriate agent

### Agent Specialization
- Code analysis agents
- Architecture reasoning agents
- Documentation agents
- Testing agents
- Tool agents (build, deploy, etc.)

### Orchestration Policies
- Explicit policies govern agent interaction
- Approval gates between agents
- Human in the loop for critical transitions
- Fallback to human when agents disagree

### Agent Handoff Protocol
- Formal handoff between agents
- Memory synchronization
- State preservation
- Error recovery

### Organizational Memory
- Memory shared across teams
- Organizational patterns and lessons learned
- Standards and constraints database
- Compliance and security memory

**Estimated:** 4-6 months post-v1.5

**Prerequisite Decisions:**
- How do agents communicate?
- What is the consistency model for shared memory?
- How are conflicts resolved between agents?

---

## Phase 4: Advanced Capabilities (v2.5+)

**Goal:** Specialized capabilities for complex engineering scenarios.

**Possible Features:**

### Real-Time Collaboration
- Live session sharing
- Simultaneous editing with conflict resolution
- Async and sync collaboration modes

### Advanced Pattern Recognition
- System learns architectural patterns from decision history
- Patterns are validated across projects
- Recommendations become increasingly accurate

### Compliance and Audit
- Audit trail with full decision lineage
- Compliance rules enforcement
- Immutable record of all approvals

### Advanced Debugging
- Event replay with full state reconstruction
- Time-travel debugging of decisions
- What-if analysis (replay with different choices)

### Custom Agent Extensions
- Users can define new agent types
- Plugin system for domain-specific reasoning
- Marketplace for shared agent types (future)

---

## Phase 5: Research and Exploration (Post-v2.5)

**Speculative capabilities depending on research outcomes:**

- Advanced reasoning models (long-horizon planning, counterfactual analysis)
- Autonomous debugging and root cause analysis
- Organizational knowledge graphs
- Cross-team learning and pattern propagation
- Novel memory consolidation techniques
- Advanced provenance tracking

---

## Implementation Language and Tooling

**Confirmed:** Go is the primary implementation language for MVP.

**Rationale:** 
- Concurrent execution model matches multi-session needs
- Fast compilation and deployment
- Good ecosystem for CLI/TUI tooling
- Memory management suitable for long-running agents

**Future:** Language choice for agent runtime may differ (Python for reasoning, Go for infrastructure, etc.)

---

## Cross-Cutting Concerns

### Storage Evolution

- **MVP:** Abstract storage interface, initial implementation TBD
- **v1.0:** Support for Postgres or equivalent
- **v1.5+:** Optional graph extensions, vector store integration

### LLM Provider Strategy

- **MVP:** Claude (Anthropic SDK)
- **v1.0:** Abstract provider interface, support Claude + OpenAI
- **v1.5+:** Add Llama, local models, cost optimization

### Observability and Debugging

- **MVP:** Comprehensive logging and trace inspection
- **v1.0+:** Metrics and performance monitoring
- **v1.5+:** Observability dashboard, trace correlation

### Safety and Approvals

- **MVP:** Conservative (all dangerous ops require approval)
- **v1.0:** Configurable approval thresholds
- **v1.5+:** Workflow-based approval policies
- **v2.0+:** Risk assessment and adaptive approval

---

## Known Unknowns

See [../bootstrap/open_questions.md](../bootstrap/open_questions.md) for full list.

Key unknowns affecting roadmap:

1. **Session vs Task semantics** — How these are modeled affects v1.5+ planning
2. **Memory representation** — Decision structure affects query capabilities in v1.0
3. **Event sourcing** — Whether entire system is event-sourced affects architecture
4. **Retrieval model** — Whether embeddings are core or optional affects v1.0 timeline
5. **Storage abstraction** — Final form affects implementation complexity

---

## Guiding Principle

Each phase proves value and validates assumptions before the next phase.

Speculation is deferred. Decisions are made on evidence, not roadmap hopes.
