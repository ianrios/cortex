---
"@ianrios/drift": minor
---

First alpha of the drift harness: `runChecks` runs a registry of lazy,
pure check functions whose keys are your violation-type union (typed
end-to-end), isolating throws as `errors` entries so one broken check
never hides the rest. `formatChecks` maps results to human or stable
`--json` (`{ violations, errors }`) output with exit codes 0 (clean),
1 (drift found), 2 (no valid verdict — a check crashed). No CLI, no
config file, no file walking: your script owns IO; the harness owns
running, typing, and reporting.
