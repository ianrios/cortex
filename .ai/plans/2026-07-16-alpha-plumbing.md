# Alpha plumbing: changeset readiness + CI

Status: planned 2026-07-16; zero-context review same day, verdict
"implement with amendments" — folded below.
Publishing itself (tag vs snapshot-publish to npm) is Ian's decision and
NOT in this plan; this makes the repo ready for either.

## Facts

- Changesets initialized, zero pending changesets;
  `.changeset/config.json` has `access: "restricted"` — contradicts the
  ratified "npm scope: @ianrios, public" (CONTEXT.md).
- No `.github/workflows/`. Remote: github.com/ianrios/cortex.
- Root `pnpm check` = typecheck → test → `node packages/brickwall/dist/
  cli.js` — it NEEDS a prior build (dist committed nowhere).
- packageManager pnpm@11.1.2; engines node >=20 (developed on 24).
- brickwall\@0.0.0, no publishConfig key.

## Changes

1. `.changeset/config.json`: `access` → `"public"` AND
   `"snapshot": { "useCalculatedVersion": true }` — without it the
   installed changesets (2.31) ignores the bump and snapshots as
   `0.0.0-alpha-*` (verified in assemble-release-plan source).
2. `packages/brickwall/package.json`: add
   `"publishConfig": { "access": "public" }` (standard belt-and-braces
   for scoped packages).
3. Add `.changeset/brickwall-alpha.md`: minor bump for
   `@ianrios/brickwall` summarizing the alpha surface (context budgets
   + warnings channel + --all audit; archiveDirs taxonomy; breaking
   --json shape already noted in README changelog).
4. `.github/workflows/ci.yml`: on push + pull_request to main; matrix
   node 20 and 24 (test the engines floor and the dev version);
   pnpm/action-setup@v4 (reads packageManager), actions/setup-node@v4
   with pnpm cache; steps: `pnpm install --frozen-lockfile` →
   `pnpm build` → `pnpm check` (typecheck → tests → brickwall
   self-check, per the handoff's install/build/test/self-check).

## Verification

- COMMIT FIRST, then dry-run: `changeset version --snapshot alpha`
  CONSUMES the changeset file and creates an untracked CHANGELOG.md —
  recover with `git reset --hard` + `git clean` of the generated
  CHANGELOG (an uncommitted changeset would be unrecoverable, and the
  snapshot CHANGELOG must not ride into a later commit).
- Dry-run produces `0.1.0-alpha-<datetime>` (14-digit datetime) in
  brickwall package.json; changeset md needs the scoped name QUOTED in
  frontmatter.
- `pnpm changeset status` lists brickwall under minor, exit 0.
- Fresh-clone CI simulation (dist/ exists locally, so a green local
  check proves nothing): `git clone . <tmp> && pnpm install
  --frozen-lockfile && pnpm build && pnpm check` — the exact CI
  sequence.
- Workflow: action-setup BEFORE setup-node with `cache: pnpm`
  (load-bearing order); no `version` input (packageManager field wins);
  `concurrency` + push restricted to main. YAML parse + note that first
  real execution is on Ian's next push.
- `pnpm check` still green (workflow lands in ignored `.github`;
  changeset md in ignored `.changeset`).

## For Ian (decision the handoff reserves)

Tag a 0.1.0 release vs `changeset publish --snapshot alpha` to npm —
present both with the exact commands at session end.
