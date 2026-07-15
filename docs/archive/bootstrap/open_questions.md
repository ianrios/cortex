# Cortex — Open Questions (v0.1)

## Memory Architecture
- What is the final structure of "intent memory"?
- How should decisions be represented (event vs graph vs hybrid)?
- Should memory be event-sourced from the beginning?

## Retrieval Strategy
- When do we use semantic retrieval vs structured queries?
- Are embeddings necessary at MVP stage or optional later?
- How do we prevent contradictory memory retrieval?

## Storage Layer
- Is Postgres sufficient for all initial memory types?
- Do we need graph extensions or separate graph DB later?
- What is the boundary between local filesystem and DB?

## Agent Model
- What is the exact lifecycle of a "session"?
- How do multiple sessions share or isolate memory?
- How do agents hand off work?

## Execution Model
- What defines a "task" vs a "session" vs a "workflow"?
- Should tasks be file-based (markdown) or database entities?

## CLI/TUI Model
- What is the minimal usable terminal interface?
- What is human vs agent parity in commands?

## Event Model
- What events must be captured?
- How is replay/debugging implemented?
- How is memory derived from event history?
