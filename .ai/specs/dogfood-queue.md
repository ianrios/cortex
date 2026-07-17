# Dogfood queue

Which repos brickwall gets run against, and status. Private production
repos (NDA) are tracked ON THE DRIVE at
`/Volumes/Extreme 510/Knowledgebase/CORTEX-DOGFOOD.md` — per RULES.md
nothing identifying them (names, paths below the drive root, code)
enters this repo; findings come back generically.

## Done

- petal (2026-07-15) and ianrios.github.io (2026-07-16) — full
  migrations, archived plans hold the semantic-delta records.
- Two NDA production repos surveyed + benchmarked (2026-07-17): 31k-file
  non-git monolith 4.1s full run; 2k-file git repo 0.9s. See the
  config-surface plan's scale-facts section.

## Public queue (Ian's repos — full migrations allowed)

- github.com/ianrios/the-algo-knows-best
- github.com/ianrios/thealgobackend
- github.com/ianrios/BarelyEnoughIngredients

## Public queue (third-party — run + record findings, NEVER push)

- github.com/sodiray/radash
- github.com/jjacoblee/arborist (Jacob's; collab question in cleanup.md)
- github.com/toolkit-for-ynab/toolkit-for-ynab

## Method (proven template, archived dogfood plans)

Survey facts first-hand → map semantics → document deltas → never raise
budgets silently → log friction in WORK.md. Honor .nvmrc/engines before
installing anything.
