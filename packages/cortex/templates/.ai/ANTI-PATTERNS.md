# Anti-patterns

Failures that burn time. Seeded with transferable lessons; add your
own WITH the incident that taught them — specifics are what make
these stick.

**Inline escape hatches are the enemy.** No disable-pragmas to silence
checks. Exemption happens through visible lifecycle (archive dirs,
warned config exemptions), never inline comments.

**Do not declare work done when automated checks pass.** Checks are
necessary, not the finish line. Behavior is verified by running the
thing; doc updates complete before anything is done.

**Folding means replacing the section, not adding a header above old
content.** After folding, the finished phase is exactly one line.

**Never `git add -A` in a shared working tree.** It sweeps unreviewed
files into commits. Stage by explicit path; review anything you did
not create.

**Copy config files from a working repo before generating from
scratch.** Use `cp` then edit. Never recreate from memory a file that
already exists somewhere proven.
