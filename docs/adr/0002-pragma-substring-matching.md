# ADR 0002: bannedPragmas match as bare per-line substrings

Date: 2026-07-17. Status: accepted (Ian, ratification round).

## Decision

`bannedPragmas` (replacing `banEslintDisable`) is a string list matched
as naive per-line substrings in every code file — tests included, no
comment parsing. Default `["eslint-disable"]`; `[]` disables. The
`--json` violation type becomes `banned-pragma`.

## Alternatives rejected

- **Per-language comment parsing**: the old regex only understood `//`
  and `/* */`, so `# noqa` could never fire — a comment grammar per
  language is real complexity in a zero-dependency tool, for precision
  the check never promised (prose mentions flag deliberately).
- **Keeping test files exempt**: they were skipped before any code
  check ran; a pragma in a test silently escaped. Nothing silently
  escapes the ban (Ian).

## Consequences accepted

- String literals mentioning a pragma flag too. Pragma-bearing test
  DATA lives in fixture files under a visibly-ignored dir, never
  inline; brickwall's own defaults move to a JSON data file the
  scanner never reads.
- Prose false-positives remain a documented, deliberate property.
