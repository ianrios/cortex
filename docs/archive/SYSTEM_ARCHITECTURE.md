# System Architecture

High-level conceptual architecture of Cortex. Implementation details are intentionally deferred.

## Conceptual Layers

```
┌─────────────────────────────────────────────────────┐
│           Terminal Interface (TUI)                  │
│  - slash commands, session navigation, inspection   │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│        Agent Runtime & Orchestration                │
│  - request parsing, planning, execution, feedback   │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────────────┐
│          Tool Execution & Safety                    │
│  - approval gates, tool invocation, logging         │
└──────────────┬──────────────────────────────────────┘
               │
      ┌────────┴───────────┐
      │                    │
┌─────▼──────┐  ┌──────────▼────────┐
│Memory      │  │Event Log &        │
│System      │  │Tracing            │
├─────────────┤  ├──────────────────┤
│- intent    │  │- action log       │
│- decision  │  │- decision events  │
│- session   │  │- approval record  │
│- semantic  │  │- execution trace  │
└─────┬──────┘  └──────────┬────────┘
      │                    │
      └────────┬───────────┘
               │
        ┌──────▼──────────┐
        │Storage Layer    │
        │(abstracted)     │
        │                 │
        │Implementations: │
        │- Postgres       │
        │- SQLite         │
        │- File-based     │
        │- Hybrid         │
        └─────────────────┘
```

## Core Components

### 1. Terminal Interface (TUI)

**Responsibility:** Human interaction, session management, inspection

**Concerns:**
- Slash command parsing
- Session creation, switching, management
- Memory query and retrieval UI
- Trace and log inspection
- Approval prompt display

**Abstraction:** Text-based interface to underlying systems, not responsible for reasoning.

---

### 2. Agent Runtime

**Responsibility:** Request handling, planning, execution orchestration

**Conceptual Flow:**
```
Request (human input) 
  → Parse intent + context
  → Query memory (prior decisions, constraints)
  → Generate plan (reasoning steps)
  → For each step:
    - Decide if approval needed
    - Request approval if required
    - Execute tool
    - Record result
  → Update memory with outcome
  → Return response to human
```

**Key Aspects:**
- Stateless between tool calls (memory provides context)
- All reasoning steps are logged
- Failures are recoverable (can retry, skip, or escalate)
- Memory queries inform every decision

**Abstraction:** Agent is unaware of how memory is stored or retrieved; it just requests and receives.

---

### 3. Tool Execution & Safety

**Responsibility:** Approval gates, tool invocation, execution logging

**Safety Model:**
- Dangerous operations require explicit approval
  - File deletion/modification
  - Git operations
  - System commands
  - Significant code changes
- Approval is logged with context
- Humans can review before approving
- Tool output is captured and traced

**Abstraction:** Tools are pluggable; system routes requests to appropriate tool handlers.

---

### 4. Memory System

**Responsibility:** Persistent storage and retrieval of engineering artifacts

**Memory Types:**

#### Session Memory
- Scoped to current interaction
- Includes conversation history, context
- Persists until session ends
- May be archived for later retrieval

#### Intent Memory
- Records WHY decisions were made
- Captures tradeoffs considered
- Constraints that shaped decisions
- Often filled in by human explanation, validated by agent

#### Decision Memory
- Structured record of choices made
- Alternatives considered
- Rationale
- Expected outcomes
- Actual outcomes (updated later)

#### Event Memory
- Immutable log of actions and decisions
- Forms basis for replay and debugging
- Contains all relevant context
- Can derive other memory types from events

#### Semantic Memory (Post-MVP)
- Derived from intent and decision memory
- Supports similarity queries
- Complements structured queries
- Optional (embeddings not required for MVP)

**Interfaces:**
- Memory retrieval (by project, by date, by tag, by semantic similarity)
- Memory write (decisions, intent, session context)
- Memory query (structured queries, consolidation)
- Memory versioning (memory evolves as we learn more)

**Abstraction:** Memory system doesn't care how data is stored; it provides query and write APIs that storage layer implements.

---

### 5. Event Log & Tracing

**Responsibility:** Immutable record of reasoning and execution

**Captured Events:**
- Decision events (what was chosen, why)
- Approval events (what was approved, who, when)
- Execution events (tool called, parameters, result)
- Failure events (what went wrong, context)
- Memory events (what was written, when, why)

**Purposes:**
- Audit trail (all decisions are traceable)
- Debugging (replay reasoning, understand failures)
- Memory derivation (events feed memory consolidation)
- Compliance (record of approvals and decisions)

**Abstraction:** Events are immutable and semantically meaningful; storage is abstracted.

---

### 6. Storage Layer

**Responsibility:** Persistence, querying, optimization

**Abstraction Requirements:**
- Support memory read/write
- Support event log append
- Support queries:
  - By project/workspace
  - By time range
  - By tags
  - By semantic similarity (post-MVP)
- Transaction guarantees (prevent corruption)
- Reasonably fast queries (interactive speed)

**Pluggable Implementations:**
- Postgres + extensions
- SQLite
- File-based + index
- Hybrid (hot data in memory, cold in DB)

**Not locked to:** Any specific DB vendor or architecture. Abstraction is deliberate.

---

## Data Flow Example: Decision Documentation

```
Human: "We decided to use async/await instead of promises. These were 
        the constraints: we need type safety and good tooling. Promises
        had worse TypeScript support. Main risk: team needs training."

        ↓ (TUI parses command)

Agent Runtime:
  - Recognizes "decision documentation" intent
  - Queries memory: prior decisions in this area
  - Structures decision with:
    * chosen: async/await
    * alternatives: promises, callbacks, generators
    * constraints: type safety, tooling, team skills
    * tradeoffs: async/await is harder to learn initially
    * rationale: TypeScript support is critical
    * risks: team training needed
  - Generates summary for human review
  - Waits for approval

        ↓ (Human approves)

Tool Execution:
  - Record approval event
  - Memory system:
    * Writes decision record
    * Writes intent record (captures reasoning)
  - Event log:
    * Records approval
    * Records decision write
    * Records any conflicts with prior decisions

        ↓

Storage Layer:
  - Persists decision and events
  - Indexes by project, date, tags
  - Becomes queryable for future sessions
```

---

## Key Design Decisions (Reflected in Architecture)

### 1. Layered Architecture
Clear separation between UI, reasoning, execution, memory, and storage. Allows each layer to evolve independently.

### 2. Abstracted Storage
No single storage choice locks system design. Implementations can vary.

### 3. Event as Primary Record
Events are immutable and semantic. Memory is derived from events.

### 4. Approval Gates at Execution Time
Safety is enforced at tool invocation, not memory level.

### 5. Memory as System Primitive
Agent reasoning relies on memory queries. Memory is not optional.

### 6. Explicit Tracing
All decisions and execution are logged. No hidden reasoning.

---

## Unresolved Architecture Questions

1. **Agent-to-Tool Interface:** What does the contract look like? Sync vs async? Streaming responses?

2. **Session State:** Where does it live? In memory during session, then archived? Persisted immediately?

3. **Memory Consolidation:** When do we derive higher-level memory from events? Immediately? Periodically? On-demand?

4. **Multi-Session Memory Isolation/Sharing:** Do concurrent sessions see each other's memory? Write to shared space?

5. **Approval Flow:** Synchronous (block agent) or asynchronous (agent continues)? How are conflicts handled?

6. **Event Replay:** Can we fully reconstruct agent reasoning from events? What's the minimum event set needed?

See [../bootstrap/open_questions.md](../bootstrap/open_questions.md) for full list.

---

## What This Architecture Enables

✓ Persistent memory across sessions  
✓ Full inspectability of reasoning and execution  
✓ Safe tool execution with approval gates  
✓ Storage flexibility (can swap implementations)  
✓ Audit trail (complete decision history)  
✓ Event replay for debugging  
✓ Future extension without core redesign  

---

## Implementation Constraints

- **MVP Language:** Go (confirmed)
- **MVP Storage:** TBD (abstraction allows flexibility)
- **MVP LLM Provider:** Claude (Anthropic SDK)
- **MVP Concurrency:** Single-user, single-machine
- **MVP Performance:** Prioritize correctness over speed

---

See [MEMORY_ARCHITECTURE.md](MEMORY_ARCHITECTURE.md) for detailed memory design.

See [EVENT_MODEL.md](EVENT_MODEL.md) for event sourcing details.

See [AGENT_SPEC.md](AGENT_SPEC.md) for agent behavior specification.
