# ADR 0001: diff mode is the default; CI/hooks opt into --full explicitly

Date: 2026-07-17. Status: accepted (Ian, ratification round).

## Decision

A bare `brickwall` run checks content budgets only on files changed vs
`--base` (default `HEAD`, always including staged/unstaged/untracked).
Path-only checks (doc count, exemption-debt warnings) stay repo-wide in
every mode. `--full` reads everything (the old default); `--audit`
(renamed from `--all`) is the shields-off fs-walk audit. CI and git-hook
recipes must say `--full` explicitly; every existing invocation (petal
pre-push, cortex CI and check script) migrates when this lands.

## Alternatives rejected

- **Full as default**: wrong ergonomics for the primary consumer — an
  agent loop touching a handful of files in a large repo. Ian's call:
  diff is the primary mode.
- **Auto-detect `CI=true` → full**: closes the vacuous-gate footgun
  (diff-vs-HEAD is empty on committed work) invisibly. Rejected as
  environment-dependent behavior switching — "nothing silently
  ignorable" loses to convenience nowhere in this toolkit.

## Consequence accepted

A bare `brickwall` in CI is vacuously green. The cost of explicitness
is a documented migration, not a hidden mode.
