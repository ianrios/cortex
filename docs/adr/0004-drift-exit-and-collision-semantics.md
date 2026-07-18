# ADR 0004: drift exit codes and check-pack collision semantics

Date: 2026-07-17. Status: accepted (Phase 2 plan, peer-reviewed).

## Decisions

1. **Exit codes**: 0 clean, 1 drift found, 2 when ANY check throws.
   The cross-engine meta-semantic is 0 = clean verdict, 1 = dirty
   verdict, 2 = NO VALID VERDICT. brickwall reaches 2 before checks
   run (config/usage error); drift also reaches it at runtime when a
   userland check crashes — different trigger, same meaning. A crash
   outranks reported violations because nothing was fully checked.
2. **Collisions**: no runtime namespacing. Check packs compose by
   object spread in the consumer's registry; duplicate literal keys
   are a TypeScript error, a spread override is last-wins and
   UNFLAGGED. Acceptable until a real prebuilt pack exists.

## Alternatives rejected

- **Exit 1 on a crashed check**: falsely asserts "drift found" when
  nothing was verified, and lets a crashing check masquerade as an
  ordinary red build that someone waves through.
- **Letting throws propagate** (the pre-extraction behavior): one
  broken parser hid every later check's verdict behind a stack trace
  with Node's default exit 1.
- **Runtime namespace machinery for packs**: speculative — no pack
  exists; the repo refuses syntax ahead of demonstrated need (same
  reasoning that rejected `extends` twice).

## Consequences accepted

- CI observers must know 2 means "fix the checks/config", not "more
  drift than usual".
- Pack authors get no collision diagnostic beyond the documented
  last-wins rule; revisit when the first pack ships.
