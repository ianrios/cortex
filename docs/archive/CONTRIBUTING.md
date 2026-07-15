# Contributing to Cortex

Cortex is a systems project, not a feature factory. Contributors should understand this and align their work accordingly.

## Guiding Philosophy

**Cortex values:**
- Architecture clarity over implementation speed
- Explicit assumptions over silent decisions
- Continuity over novelty
- Reasoning over code volume
- Long-term sustainability over short-term optimization

---

## Before You Code: Architecture-First Culture

### 1. Understand the Design Context

Before implementing anything, read:
- [VISION.md](VISION.md) — Why does Cortex exist?
- [PRINCIPLES.md](PRINCIPLES.md) — What values guide decisions?
- [/bootstrap/decisions.md](../bootstrap/decisions.md) — What's already decided?
- [/bootstrap/open_questions.md](../bootstrap/open_questions.md) — What's still unresolved?

### 2. Recognize Open Questions

If your work touches an open question, **stop and discuss first**.

Examples of "touching an open question":
- Designing memory storage (open: "What is final storage abstraction?")
- Building event log (open: "What events must we capture?")
- Implementing session model (open: "What defines session boundaries?")
- Creating LLM interface (open: "How do we support multiple providers?")

**If uncertain whether your work touches open questions, assume it does and ask.**

### 3. Write an RFC-Style Proposal

For any non-trivial work:

1. **Problem statement** — What needs solving? Why?
2. **Proposed solution** — What's your approach?
3. **Assumptions** — What must be true for this to work?
4. **Open questions** — What's unclear?
5. **Alternatives** — What else could we do?
6. **Impact** — What does this enable/prevent?

Use a GitHub issue or discussion. Include examples and diagrams. Invite critique.

**No implementation without design discussion.**

---

## ADR (Architecture Decision Records)

For significant decisions, create an ADR.

**Location:** `/docs/adr/`

**Format:**
```markdown
# ADR-001: Decision Title

## Status
Proposed | Accepted | Deprecated

## Context
Why does this decision matter? What problem are we solving?

## Decision
What are we deciding?

## Rationale
Why this way and not alternatives?

## Consequences
What does this enable? What does it prevent?

## Open Questions
What's still unclear?
```

**Example:** ADR for memory storage choice, event types, session semantics, etc.

---

## Documentation Expectations

### Update Docs as You Go

Don't code first, document later. Code and docs evolve together.

**When you implement something:**
1. Document what you're doing (in code: comments explaining WHY)
2. Update relevant design docs
3. Note assumptions and open questions
4. Update /NOTES.md with decisions made

### Assumption Visibility

**Never silently invent architecture.**

If your implementation requires assumptions:
1. List them explicitly in code comments or docs
2. Mark unclear areas with TODO or FIXME
3. Flag post-MVP decisions as such
4. Reference open questions where relevant

### Comment Only the WHY

- Don't explain what the code does (names should do that)
- DO explain why it's done this way (non-obvious reasoning)
- DO link to ADRs or design docs
- DO note workarounds with the context that necessitated them

---

## Code Review Expectations

### All PRs Should Include

1. **What:** What changed?
2. **Why:** Why was this change necessary?
3. **Design decisions:** What architectural choices does this make?
4. **Assumptions:** What must be true?
5. **Open questions:** What's still unresolved?
6. **Testing:** How was this verified?

### Review Focus

Reviewers should ask:

- Does this align with established principles?
- Are assumptions explicit?
- Does this touch an open question without discussing it?
- Is the reasoning clear?
- Could this architecture be simpler or more maintainable?
- What does this enable/prevent in the future?

---

## Testing Philosophy

### What Gets Tested

- **Core abstractions:** Memory interface, event log, storage layer
- **Safety-critical:** Approval gates, dangerous operations
- **Integration:** Agent behavior, memory-to-reasoning feedback
- **Regression:** Major refactors and fixes

### What Doesn't Get Tested (MVP)

- Performance optimization (profile first, optimize later)
- Edge cases in inactive code paths
- Complex error recovery (focus on happy path initially)

### Testing Culture

- Tests should be readable (they document expected behavior)
- Tests should test behavior, not implementation
- Tests should catch regressions, not dictate design

---

## Performance and Optimization

### Philosophy

**Correctness and clarity first. Optimize what's actually slow.**

### Before Optimizing

1. Have we hit a performance problem in real usage?
2. Have we profiled to find the bottleneck?
3. Have we exhausted simpler solutions (better algorithms, caching)?
4. Will this optimization make the system harder to understand?

### Avoid Premature Optimization

- Don't optimize code paths that aren't used
- Don't cache before measuring that lookup is slow
- Don't over-engineer for scalability not yet needed
- Don't sacrifice clarity for speed

---

## Dependency Management

### Adding Dependencies

Before adding a dependency:
1. Is there a lightweight alternative?
2. Does this add complexity to the memory/event model?
3. Does this lock us into a specific provider/architecture?
4. Can we defer this to a post-MVP phase?

### Rationale Logging

If you add a dependency, document:
- Why we need it
- What problem it solves
- Why alternatives weren't suitable
- When it can be removed (if temporary)

---

## Working on Open Questions

If you're working to resolve an open question (e.g., "What is memory storage?"):

1. **Explore thoroughly.** Research options, build prototypes.
2. **Document alternatives.** What did you consider? Why did you reject options?
3. **Make assumptions explicit.** What must be true for your choice to work?
4. **Design for change.** Even if you pick one option, others can be swapped later.
5. **Propose, don't declare.** Present findings, ask for feedback.

---

## Long-Term Thinking

Cortex is a multi-year project. Decisions should consider:

- **Evolvability:** Can we change this later without rewriting everything?
- **Extensibility:** Does this design allow new capabilities without core changes?
- **Understandability:** Will future contributors understand this in 2 years?
- **Sustainability:** Is this maintainable by small team long-term?

---

## Architecture Review Checkpoints

Before launching a new phase or system:

- [ ] All assumptions documented
- [ ] Open questions have been discussed
- [ ] Simpler alternatives were considered
- [ ] Design can evolve without breaking changes
- [ ] Long-term implications understood
- [ ] Team alignment on direction

---

## Code Style and Standards

### Go Code (MVP Language)

- Prefer clarity over cleverness
- Comment exported types and functions
- Keep functions small (< 30 lines, aim for < 15)
- Meaningful names (no abbreviations unless standard)
- Error handling is explicit (don't swallow errors)

### Configuration and Constants

- No magic numbers
- Configuration is explicit, not hardcoded
- Environment variables for deployment config
- Feature flags only for experimental work

### Logging

- Log decisions and reasoning, not just errors
- Include context (project, session, user)
- Structured logging (key-value pairs, not printf strings)
- Distinguish:
  - DEBUG (low-level detail)
  - INFO (events, decisions)
  - WARN (unexpected but recoverable)
  - ERROR (failures, needs attention)

---

## Communication

### When Asking Questions

- Be specific (what aspect, what assumption?)
- Provide context (what are you working on?)
- Show what you've already tried/researched
- Be open to alternatives

### When Proposing Changes

- Lead with the problem, not the solution
- Explain trade-offs, not just benefits
- Acknowledge what's uncertain
- Invite critique and alternative ideas

### When Reviewing

- Assume good intent
- Ask questions instead of making demands
- Explain the WHY behind feedback
- Celebrate good design decisions

---

## Learning More

- Explore `/bootstrap/` for initial context and questions
- Read `/docs/adr/` for past decisions
- Check NOTES.md for running project log
- Review pull requests and their discussions for how decisions were made

---

See [PRINCIPLES.md](PRINCIPLES.md) for core design values.

See [VISION.md](VISION.md) for long-term direction.

See [README.md](../README.md) for project overview.
