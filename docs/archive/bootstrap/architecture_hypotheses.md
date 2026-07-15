# Cortex — Architecture Hypotheses (v0.1)

These are NOT decisions. They are working hypotheses.

## Memory System
- Likely requires multiple memory types:
  - event-based memory (log of actions and decisions)
  - semantic memory (retrieval layer)
  - intent memory (why decisions were made)
  - session memory (short-lived context)

## Storage Hypothesis
- A single storage system is likely insufficient long-term
- Postgres may be an initial unifying layer
- Future may require hybrid:
  - relational + event log + graph + vector search

## Event Sourcing Hypothesis
- Event sourcing may be fundamental to:
  - debugging agent reasoning
  - reconstructing cognition state
  - replaying decisions

## Retrieval Hypothesis
- Embeddings alone are insufficient for cognition
- Semantic similarity ≠ reasoning correctness
- Hybrid retrieval will be required

## Execution Model Hypothesis
- System likely needs:
  - human-in-the-loop approval gates
  - tool execution registry
  - inspectable action traces

## UI Hypothesis
- Terminal-first interface is optimal initial surface
- TUI likely better than CLI-only commands
- Visual debugging of agent reasoning may become critical
