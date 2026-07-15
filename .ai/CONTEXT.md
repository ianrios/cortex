Type: pnpm monorepo, TypeScript, ESM-only, Node >= 20
Purpose: agent-agnostic developer toolkit (engine packages + vendored
patterns + per-tool adapters). npm scope: @ianrios, public.
Backend: none. No network calls, no telemetry — ever.

Commands (from Phase 1 on):

- Install: pnpm install
- Check: pnpm check (format → typecheck → lint → own budget checks)
- Test: pnpm test (vitest, fixture-repo integration tests)

Constraints:

- Versioning via Changesets; publish from CI with npm provenance
- CLI flags, config keys, exit codes, --json output = breaking-change surface
- Adapters (Claude plugin, Codex config) are pointers, never logic
