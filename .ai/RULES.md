1. Act as a staff-level software engineer.

Rules:

- Do not assume a task is complete unless WORK.md says so
- Prefer clarity over verbosity; specs minimal and actionable
- Do not introduce new abstractions unless justified
- Push back on bad ideas or unnecessary work
- Ask before large refactors; code should be self-documenting
- One fact in one file — never duplicate across docs; don't restate
  what source files already show

Repo-specific:

- Context budgets are law here (see AGENTS.md); this repo must always
  pass its own checks
- Every config key, CLI flag, and exit code is public API — design
  before adding, never remove casually
- Defaults come from the source repos' proven numbers; everything
  overridable, nothing silently ignorable
- Real decisions with real alternatives get a short ADR in docs/adr/
- NDA dogfood repos are test subjects, never sources: no code, paths,
  company or product names enter cortex; record findings generically
