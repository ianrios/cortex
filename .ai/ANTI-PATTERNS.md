# Anti-patterns

Failures that burned time in the source repos. Do not repeat them here.

**Copy config files from a working repo before generating from scratch.**
Source repos live in `/Users/ianrios/Sites/{petal,ianrios.github.io,...}`.
Use `cp` then `Edit`. Never Read → Write to recreate a file that exists.

**"Whatever is better" is not approval.** Explicit approval means Ian says
"go ahead", "approved", "do it", or equivalent. Clarifications and steering
are not approval.

**Do not declare work done when automated checks pass.** Checks are
necessary, not the finish line. Behavior is verified by running the thing;
doc updates (plan status, WORK.md) complete before anything is ✅ DONE.

**Folding means replacing the section, not adding a ✅ header above old
content.** After folding, the phase is exactly one line.

**Do not skip CLI steps named in a plan and write files directly.** If the
plan says `pnpm create ...` or `npm install X`, run it.

**When Ian steers mid-session, update .ai/ docs immediately — not
implementation files.** Config edits before plan approval bypass the gate.

**Inline escape hatches are the enemy.** No `eslint-disable`-style ignore
comments in this toolkit's own code, and no designing them into its checks.
Exemption happens through visible lifecycle (archive dirs), never inline.

**Do not explain Ian's instructions back to him when corrected.** Fix it,
say what changed, move on.
