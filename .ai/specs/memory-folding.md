# Memory folding: session findings → long-term memory

The practice this repo runs at every phase close and session close, made
explicit so it can become a shippable cortex piece (see BACKLOG:
memory-fold tool). Ian, 2026-07-16: converting short-term session memory
into long-term documentation is left-shifting — the next agent starts
where this one ended instead of rediscovering it.

## The channels — every finding type has exactly one home

| Finding | Destination | Lifetime |
| ------- | ----------- | -------- |
| Failure that burned time | .ai/ANTI-PATTERNS.md (one bolded rule + evidence + date) | permanent behavioral memory |
| Friction / missing feature discovered in use | .ai/WORK.md open questions (one line; detail stays in the archived plan that hit it) | until designed or refuted |
| Decision made or reversed | the doc that asserted the old state (BACKLOG, EXTRACTION_PLAN decisions) + WORK.md "resolved" | permanent |
| Concept from Ian's head | .ai/specs/ians-brain.md (a section per concept) | permanent |
| Finished plan + its full delta/verification record | git mv → .ai/completed/ ; referencing docs fold to one line | archival (exempt from budgets) |
| Cross-session state ("where were we") | WORK.md current focus + a handoff plan in .ai/plans/ | replaced each session |
| Lesson private to one agent's harness | that agent's own memory store (e.g. Claude's project memory dir) | agent-local, never repo-owned |

## The rules that make it work

- One fact, one file — a finding is WRITTEN once and POINTED at
  elsewhere; duplication is drift waiting to happen.
- Fold, don't append: closing a phase REPLACES its section with one
  line + a pointer to the archive. Budgets (brickwall) force the
  compression — an unfolded doc eventually fails the gate.
- Fold at the moment of finding, not at session end — end-of-session
  folding loses the details that made the lesson transferable.
- The finding's evidence travels with it (commit hash, file:line, the
  actual error) — an unevidenced lesson gets relitigated.
- Repo docs serve the NEXT agent, any vendor; agent-local memory serves
  ONE agent. Never put repo truth in agent memory or vice versa.

## Worked example (2026-07-16, the CI failure)

Finding: all five first CI runs failed — pnpm 11 needs node >= 22.13,
so the node-20 matrix leg died at install and fail-fast cancelled the
node-24 leg (evidence: runs 29518225584…29518886965; fix be83581).

Folded into: ANTI-PATTERNS ("a package's engines floor is not the
toolchain's floor" — the transferable rule), the fix commit message
(the mechanics), this spec (the example), and the orchestrating
agent's local memory (how to verify: floor-test the built artifact).
NOT into WORK.md — it is fixed, not open.

## Toward the tool (backlog, not built)

What an agent/tool version does: at phase close, diff the session's
findings against the channels table; anything unhomed is a violation
(same shape as brickwall: pure check, visible output, exit code). The
retro agent (clinical's retro-first mechanics) is the natural owner;
the janitor audits the folds for drift. Vision: .ai/ becomes the
long-term memory format any vendor's agent can read AND maintain.
