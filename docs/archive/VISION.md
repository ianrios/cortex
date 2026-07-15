# Vision: Engineering Cognition Runtime

## The Problem

Modern software engineering operates in a state of permanent amnesia.

Within a single project, teams repeatedly:
- Re-examine the same architectural tradeoffs
- Rediscover why previous decisions were made
- Redo analysis of systems they built years ago
- Lose context when engineers leave or join
- Start from scratch on related problems in different repos

Between sessions:
- An engineer closes their IDE and loses their reasoning context
- The next day, critical context must be reconstructed from scratch
- Architectural insights are forgotten
- Decision rationale vanishes into commit messages that rot

Between projects:
- Lessons learned in one codebase rarely transfer to another
- Similar architectural problems are solved independently each time
- Team knowledge lives in individual heads, not systems

## What Cortex Is

Cortex is a **persistent engineering teammate** that:

- Understands software systems and their evolution
- Remembers decisions, rationale, and architectural intent
- Reasons about engineering continuity across time
- Makes its reasoning auditable and inspectable
- Works in collaboration with humans, not in replacement of them

## Core Insight: Cognition as a System Primitive

Engineering teams don't lack intelligence or capability.

They lack **continuity of reasoning**.

Cortex treats cognition as a system primitive:
- Multi-session memory is not a nice-to-have, it's foundational
- Intent memory (the "why") is as important as logs (the "what")
- Reasoning traces are as important as code
- Architectural understanding is a versioned, evolving artifact
- Decision history is a queryable system

## Long-Term Goals

### By MVP
- Establish memory as a system primitive
- Enable human-agent collaboration on real engineering tasks
- Make agent reasoning fully inspectable and debuggable
- Support persistence across multiple sessions

### By v1.0
- Support multi-session workflows across projects
- Enable architectural reasoning and continuity
- Provide queryable decision history
- Support team memory (shared context, not just individual)

### By v2.0+
- Support multi-agent orchestration and handoff
- Enable organizational memory (lessons across teams/projects)
- Provide architectural pattern libraries derived from project memory
- Enable event-driven memory evolution

## Key Principles

### Continuity Over Statelessness

Traditional stateless systems (chatbots, query engines) start from zero each interaction. Cortex assumes state: persistent memory, session context, ongoing relationships.

### Reasoning Over Answers

Cortex's value is not in generating code or running tools faster. It's in preserving and evolving understanding of *why* systems are built the way they are.

### Inspectability Over Magic

No hidden reasoning. No blackbox embeddings. All agent decisions, memory retrieval, and execution must be auditable and reproducible.

### Collaboration Over Autonomy

The goal is not to replace engineers but to augment their memory and reasoning. Humans make critical decisions. Agents preserve context and suggest reasoning.

### Local-First

All data lives locally. No vendor lock-in. Engineers own their cognition system.

### Model-Agnostic

Cortex should work with Claude, GPT, Llama, or future models. No provider dependence.

## The Engineering Cognition Stack

At the highest level, Cortex layers:

1. **Memory** — persistent artifacts of understanding
2. **Reasoning** — agent processes that use memory to reason about problems
3. **Execution** — tools to act on reasoning
4. **Inspection** — debugging and auditing of the entire stack
5. **Continuity** — session and project context that threads everything together

These are **conceptual** layers. Implementation may combine or separate them differently.

## Non-Goals

- Real-time collaboration (future possibility, not MVP)
- Full project automation (human in the loop required)
- Vector search as primary retrieval (optional tooling, not core)
- Cloud-native architecture (local-first)
- General-purpose chatbot capabilities
- Code generation as primary feature

## Unresolved Architectural Questions

These are being actively designed:

- **Memory structure** — What is the final form of intent memory and decision representation?
- **Retrieval model** — How do we balance semantic vs structured memory queries?
- **Storage abstraction** — What is the boundary between filesystem and DB storage?
- **Event sourcing** — Should the entire system be event-sourced from inception?
- **Session semantics** — How do multiple concurrent sessions share or isolate memory?

See [../bootstrap/open_questions.md](../bootstrap/open_questions.md) for full list.
