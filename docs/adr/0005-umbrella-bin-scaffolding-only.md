# ADR 0005: the cortex bin owns scaffolding only — no `cortex check`

Date: 2026-07-17. Status: accepted (Phase 3 plan, peer-reviewed).

## Decision

`@ianrios/cortex` ships one command: `cortex init`. Engines keep their
own CLIs (`brickwall`); check composition lives in each consumer's
package.json.

## The alternative, stated fairly

An umbrella `cortex check` chaining brickwall + drift + lint would be
genuinely simpler for adopters: one command, one docs entry, one thing
to wire into CI. Rejected because:

- USAGE's compose-your-own doctrine already makes the consumer's
  package.json the single place where "check" is defined; an umbrella
  would be a SECOND definition that drifts from the first.
- The engines have different invocation shapes (brickwall's diff/full
  modes vs drift's no-CLI userland scripts) — an umbrella flattens
  those into lowest-common-denominator flags.
- Scaffolding and checking have different change cadences; coupling
  them couples their release cycles.

## Tripwire

Revisit when a THIRD engine ships a CLI — at three, the composition
burden on consumers may outweigh the second-definition cost.
