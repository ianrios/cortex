# Agent Instructions

<one paragraph: what this repo is and what agents may do in it.>
This file is the entry point for every coding agent.

## Session startup

1. Read `.ai/CONTEXT.md`, `.ai/WORK.md`, `.ai/RULES.md` in that order.
2. Read `.ai/ANTI-PATTERNS.md` — failures that already burned time here.
3. Check `.ai/specs/` and `.ai/plans/` for anything relevant to the
   request. Interview the human only if genuine ambiguity remains.

## Operating model

<who directs, who reviews, who approves.> Non-trivial work gets a plan
in `.ai/plans/`, reviewed before implementation. New direction needs
explicit approval — "whatever is better" is not approval. Finished
plans move (`git mv`) to `.ai/completed/` and fold to one line.

## Quality gates

<your check/test commands.> Passing gates is necessary, not
sufficient — behavior gets verified by running the thing.

## Context budgets

Doc and code budgets are enforced by `brickwall` (see
`brickwall.config.json`). Content leaves a budget by moving through
the archival lifecycle, never via an inline ignore.
