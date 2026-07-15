# Memory Architecture

Core design of Cortex's multi-layered memory system. This is the intellectual foundation of the platform.

## Memory as System Primitive

In traditional stateless systems, memory is optional. In Cortex, **memory is the system.**

The core insight: Persistent memory + structured reasoning = engineering cognition.

---

## Memory Taxonomy

### 1. Session Memory

**Scope:** Current terminal session  
**Lifetime:** Session duration (can be archived)  
**Owner:** Single user, single session

**Contains:**
- Conversation history
- Current problem context
- Discovered constraints and assumptions
- In-progress work
- Temporary reasoning state

**Characteristics:**
- Read/write access
- Isolated from other sessions (initially)
- Persists for session duration
- Archived when session ends

**Retrieval:** By timestamp within session

**Use Cases:**
- Continue work within a session without re-explaining
- Follow-up questions on prior context
- Debugging agent reasoning within session
- Session replay

---

### 2. Intent Memory

**Scope:** Cross-session, per-project  
**Lifetime:** Project lifetime  
**Owner:** Individual or team

**Contains:**
- WHY decisions were made
- Tradeoffs considered
- Constraints discovered
- Architectural reasoning
- Risk analysis
- Expected vs actual outcomes

**Characteristics:**
- Primarily written by humans (engineer explains)
- Validated/enriched by agents
- Searchable and queryable
- Evolves as we learn more
- High signal-to-noise ratio

**Structure (Tentative):**
```
Intent Record:
  - decision: what was chosen
  - alternatives: what was not chosen, why
  - constraints: what forced the choice
  - rationale: reasoning behind choice
  - tradeoffs: what we're giving up
  - assumptions: what must be true
  - risks: what could go wrong
  - timing: when was this decided
  - outcomes: what actually happened (updated later)
  - related_decisions: dependencies
```

**Retrieval:**
- By project
- By date range
- By tags (architectural area, risk level, etc.)
- By similarity to current problem (post-MVP)

**Use Cases:**
- Understand why a system is designed a certain way
- Discover prior analysis of similar problems
- Make informed decisions on related topics
- Justify architectural choices to new team members

---

### 3. Decision Memory

**Scope:** Cross-session, per-project  
**Lifetime:** Project lifetime  
**Owner:** Individual or team

**Contains:**
- Structured record of choices made
- Alternatives explicitly considered and rejected
- Approval records
- Who made the decision, when

**Structure:**
```
Decision Record:
  - what: the choice made
  - when: timestamp of decision
  - who: decision maker
  - alternatives: what was considered
  - chosen_because: why this one
  - approved_by: human approver
  - context: project/session context
  - tags: architectural area, risk, scope
```

**Characteristics:**
- Immutable once recorded
- Links to intent memory
- Queryable by many dimensions
- Forms basis for architectural pattern library

**Retrieval:**
- By project
- By decision maker
- By date
- By architectural area (tags)
- By risk level

**Use Cases:**
- Audit trail (what decisions were made, by whom, when)
- Pattern recognition (decisions across projects)
- New team member onboarding
- Compliance and documentation

---

### 4. Event Memory

**Scope:** Cross-session, per-project  
**Lifetime:** Project lifetime (immutable log)  
**Owner:** System (write-only)

**Contains:**
- Immutable log of all meaningful events
- Action events (what was executed)
- Decision events (what was chosen)
- Approval events (who approved what)
- Failure events (what went wrong)
- Memory events (what was written)

**Characteristics:**
- Append-only (immutable)
- Semantically meaningful (not raw logs)
- Fully contextual (includes all info needed to understand)
- Audit trail
- Foundation for replay and debugging

**Event Types (Tentative):**
```
DecisionEvent:
  - decision_id
  - chosen_alternative
  - rejected_alternatives
  - rationale
  - timestamp
  - agent_or_human: who made it
  - approval_required: bool
  
ApprovalEvent:
  - decision_id or action_id
  - approved: bool
  - approver: user
  - timestamp
  - reason_if_rejected

ExecutionEvent:
  - tool_name
  - parameters
  - result/output
  - duration
  - timestamp
  - approved: bool
  - approver: user

FailureEvent:
  - tool_name
  - error_message
  - context (what was being attempted)
  - timestamp
  - recovery_action
  - approver: who decided on recovery

MemoryEvent:
  - memory_type
  - memory_id
  - operation: write/update
  - content: what was written
  - timestamp
  - source: decision_event_id or manual
```

**Retrieval:**
- By project
- By time range
- By event type
- By context (decision_id, action_id, etc.)
- Chronological order

**Use Cases:**
- Replay entire reasoning for debugging
- Reconstruct agent state at any point in time
- Generate audit trail
- Detect contradictions in decisions
- Derive other memory types from events

---

### 5. Semantic Memory (Post-MVP, Optional)

**Scope:** Cross-project (optional)  
**Lifetime:** Project lifetime  
**Owner:** System (derived)

**Contains:**
- Embedding-based representations of decisions, intent, patterns
- Semantic similarity relationships
- Analogous problems and solutions

**Characteristics:**
- Derived from intent + decision memory
- Optional (system works without embeddings)
- Supports similarity search
- Complements structured queries
- Model-dependent (which embedding model?)

**Use Cases:**
- Find analogous decisions in other projects
- Discover similar architectural problems
- Recommend proven approaches
- Pattern library construction

**Open Questions:**
- Which embedding model? (Claude, OpenAI, open-source?)
- When to refresh embeddings? (always, periodic, on-demand?)
- Embedding sensitivity to prompt? (how stable are similar decisions?)
- Privacy: should embeddings be searchable across projects?

---

### 6. Organizational Memory (Post-v1.0)

**Scope:** Multi-project, multi-team  
**Lifetime:** Organizational lifetime  
**Owner:** Team or organization

**Contains:**
- Architectural patterns (proven approaches)
- Engineering standards
- Risk repositories (known risks, mitigations)
- Lessons learned
- Cross-project commonalities

**Characteristics:**
- Aggregated from individual project memories
- Read-mostly (written less frequently)
- Searched more frequently than written
- May be org-wide or team-scoped

**Use Cases:**
- Onboard engineers to org standards
- Prevent repeated mistakes across projects
- Enable cross-team knowledge transfer
- Build architectural consistency

**Open Questions:**
- Privacy boundaries (what is shareable, what is private)?
- Governance (who can add to org memory)?
- Versioning (patterns change, how do we track that)?
- Integration (how are new patterns discovered and validated)?

---

## Memory Semantics

### Chronological vs Semantic Organization

**Chronological Organization:**
- Events and sessions ordered by time
- Enables replay and timeline reconstruction
- Good for "what happened when?"
- Queries: date ranges, before/after, sequence

**Semantic Organization:**
- Decisions grouped by relationship
- Patterns emerge from decision similarity
- Good for "what's similar to this?"
- Queries: analogous problems, architectural area, risk level

**Cortex Approach:**
- **MVP:** Primarily chronological + manual tagging
- **v1.0:** Add semantic queries (exact match on tags + date)
- **Post-v1.0:** Optional embeddings for semantic similarity
- **Future:** Hybrid queries (time + semantics + relevance)

---

### Memory Lineage and Event Sourcing

**Core Idea:** All memory is derivable from the event log.

```
Event Log (immutable, source of truth)
  ↓
Decision Memory (derived: extract decisions from events)
  ↓
Intent Memory (derived: extract rationale from events + human input)
  ↓
Semantic Memory (derived: embed intent + decision memory)
  ↓
Organizational Memory (derived: aggregate across projects)
```

**Implications:**
- If we can't derive it from events, it shouldn't be in memory
- Contradictions are detectable (events tell full story)
- Replay is possible (events have all context)
- Memory is auditable (events are immutable)

**Open Question:** Should event sourcing be fundamental from MVP day 1, or can we add it later?

---

### Memory Consolidation

**Problem:** Over time, event log grows. Queries slow down. Contradictions become hard to detect.

**Solution (Conceptual):** Periodically consolidate memory.

```
Old Events + Decisions → Analysis → Updated Intent Memory + Summary
```

**Examples:**
- After 100 decisions on a topic, consolidate into a pattern
- When a decision is revised, update intent memory to reflect learning
- When outcomes prove a decision was wrong, record that learning

**Questions:**
- When does consolidation happen? (immediately, periodic, on-demand?)
- Does it create new events or modify existing memory?
- How do we preserve the original reasoning while updating based on outcomes?

**Open Design Area:** Memory consolidation strategy.

---

### Contradictory Memory Resolution

**Problem:** Over sessions, we might make contradictory decisions or learn that a past decision was wrong.

**Examples:**
- "Use NoSQL" (project A) vs "Avoid NoSQL" (project B)
- "Microservices are right for us" → (later) "Microservices were a mistake"

**Resolution Strategies (Hypothetical):**

1. **Explicit Override:** New decision explicitly revokes old one with reasoning
2. **Conditional Memory:** "NoSQL works for write-heavy systems; avoid for complex queries"
3. **Time-Based:** "Decided in 2024: use X; revised in 2025: use Y"
4. **Context-Based:** "For platform work: use X; for product: use Y"

**Open Questions:**
- How do we detect contradictions automatically?
- What's the human approval process for revisions?
- How do we learn from mistakes without invalidating past reasoning?

---

## Memory Interfaces (Abstraction)

### Write Interface

```
WriteIntent(project, decision_id, intent_record)
WriteDecision(project, decision_record)
WriteEvent(event)
WriteSessionMemory(session_id, context)
```

**Safety:** All writes are timestamped, contextualized, and logged.

### Read Interface

```
GetIntent(project, decision_id)
GetIntentByTag(project, tag, date_range)
GetIntentBySimilarity(intent_query) // post-MVP

GetDecision(project, decision_id)
GetDecisionsByPeriod(project, start_date, end_date)
GetDecisionsByArea(project, architectural_area)

GetEvents(project, type, date_range)
GetEventsByDecision(decision_id)
GetEventChain(event_id) // get preceding and following events

GetSessionMemory(session_id)
GetSessionContext(project, session_id)
```

### Query Interface

```
SearchIntent(project, query)
FindSimilarDecisions(decision_id)
AnalyzeTrends(project, time_range)
DetectContradictions(project)
AggregatePatterns(projects)
```

---

## Storage Abstraction

Memory systems don't prescribe storage implementation. The abstraction must support:

- **Reads:** Queries by project, date, tags, similarity
- **Writes:** Fast, transactional, versioned
- **Queries:** Complex queries (time range + tags + semantics)
- **Scale:** From small (single project) to large (multi-project org)

**Possible Implementations:**
- Postgres (tables for memory types, JSONB for flexible structure)
- SQLite (single file, portable, good for MVP)
- Document store (more flexible schema evolution)
- Graph DB (decision relationships, patterns)
- Hybrid (hot data in memory, cold in DB)

**Not specified:** Implementation choice is deferred. Abstraction is intentional.

---

## Memory Lifecycle

1. **Creation:** Decision made, intent captured, events logged
2. **Access:** Queried in subsequent sessions, informs new decisions
3. **Validation:** Outcomes are recorded, assumptions confirmed or invalidated
4. **Consolidation:** Similar decisions grouped, patterns extracted
5. **Archival:** Old memory remains queryable, newly discovered insights integrated

---

## Key Design Decisions (Reflected Above)

✓ Memory is multi-layered, not unified  
✓ Intent (why) is as important as decision (what)  
✓ Events are immutable, primary record  
✓ All memory is derivable from events  
✓ Chronological organization is primary, semantic is optional/post-MVP  
✓ Embeddings are optional, not required  
✓ Storage is abstracted, implementation flexible  

---

## Unresolved Design Questions

1. **Memory representation:** How granular should decision records be? Single decision or decision clusters?

2. **Intent structure:** What format captures intent without being too rigid? Structured fields vs free-form?

3. **Consolidation timing:** Periodic? On-demand? Triggered by size/age?

4. **Multi-session sharing:** Can two concurrent sessions write to same project memory? Conflict resolution?

5. **Intent validation:** How do humans validate agent-generated intent? Approval flow?

6. **Embedding stability:** If we do use embeddings, are they stable enough for long-term similarity queries?

7. **Privacy boundaries:** Between sessions? Between projects? Between individuals?

8. **Event retention:** Do we keep all events forever, or prune old ones? If prune, can we still answer historical queries?

---

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for how memory fits into overall system.

See [EVENT_MODEL.md](EVENT_MODEL.md) for event design details.

See [../bootstrap/open_questions.md](../bootstrap/open_questions.md) for context on unresolved questions.
