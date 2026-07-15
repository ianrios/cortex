# Agent Governance (Roadmap Material)

Imported verbatim from WRC's `.ai/ops/` (Feb 2026). A complete, deterministic
governance model for agents treated like employees: ownership and authority
(`AUTHORITY_MODEL.md`), a work-item schema with field-level mutability rules
(`SCHEMA.md`), and a status transition matrix with approval gating
(`STATUS_TRANSITIONS.md`). Core principle: "Status transitions encode trust.
If a transition feels unsafe to automate, it should not exist."

Status: **specification only — never implemented, never battle-tested.**
Cortex extracts what works today; this is preserved as the long-term
direction (deterministic validators as a real library), not scheduled work.
These files are exempt from context budgets as imported records.
