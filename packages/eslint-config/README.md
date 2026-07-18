# @ianrios/eslint-config

The strict typescript-eslint flat-config core proven in the source
repos: `strictTypeChecked` + `stylisticTypeChecked` (scoped to
`**/*.{ts,tsx}`), `js.configs.recommended` with node globals for
`**/*.js`, and the hard-line rules — inline `consistent-type-imports`,
`no-floating-promises`, `no-non-null-assertion`, `no-explicit-any`,
`max-len` 80, `no-console` warn. `projectService` ships ON, so
type-aware rules work with zero wiring.

## Usage

```js
// eslint.config.js
import base from '@ianrios/eslint-config';

export default [
  { ignores: ['dist/**', 'coverage/**'] },
  ...base,
  // your framework layer: react-hooks, jsx-a11y, browser globals, ...
];
```

Peer deps: `eslint >=9 <10`, `typescript-eslint >=8`, `@eslint/js`,
`globals`, `typescript >=5`.

## What is deliberately NOT here

Framework plugins (React, a11y, testing-library), ignores, browser
globals, `tsconfigRootDir` — repo choices, layered by you. The base is
the part that was identical across every source repo; your layer is
the part that never was.

Disable-pragma escapes (`eslint-disable` comments) are banned
separately by `@ianrios/brickwall` — the rules here are chosen to be
strict enough that you will be tempted; the ban is what makes the
temptation productive (fix the code, or change the rule visibly).
