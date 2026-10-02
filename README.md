# @aifabrix/ui

Shared React UI primitives for AI Fabrix applications: buttons, form controls, dialogs, menus, tables,
status presentation (`StatusBadge`, `StatusIcon`, `StatusTone`), generic application states
(`EmptyState`, `LoadingState`, `ErrorState`, `NotFoundState`), the `cn` class helper and the portable
control-state model.

Built on Radix UI, `class-variance-authority`, `cmdk` and `lucide-react`, styled with Tailwind CSS 4 utility
classes. The package ships no CSS: the consuming application's Tailwind build generates the styles.

## Install

```bash
npm install --save-exact @aifabrix/ui
```

Pin exact versions (`"@aifabrix/ui": "0.1.0"`, no `^`) while the package is `0.x`. Peer dependencies:
`react` and `react-dom` 18.2 or later.

Runtime dependencies (Radix UI, `cmdk`, `lucide-react`, …) use compatible version ranges, so an application
that already depends on them installs one copy instead of two. The lower bound of each range is the version
tested with the consuming applications.

## Entry points

| Import | Contents |
| --- | --- |
| `@aifabrix/ui` | Components, status presentation, application states, `cn` |
| `@aifabrix/ui/control-state` | React-free control-state contracts and policies |
| `@aifabrix/ui/control-state-react` | React bindings for control-state (presentation hooks, `StateReasonText`) |

Only these entries are public; deep imports such as `@aifabrix/ui/dist/...` are rejected by `exports`.
The control-state contract is described in [`src/control-state/CONTRACT.md`](src/control-state/CONTRACT.md).

## Consumer contract

The application owns global CSS, fonts, the dark-mode root class and the theme variables. To use the package:

1. Let Tailwind scan the package build. Tailwind 4 skips `node_modules` during automatic detection, so add an
   `@source` next to the Tailwind import (path relative to that CSS file):

   ```css
   @import "tailwindcss";
   @source "../node_modules/@aifabrix/ui/dist";
   ```

2. Define these theme colors (for example CSS variables mapped in `@theme inline`): `background`, `foreground`,
   `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`,
   `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `border`,
   `input`, `input-background`, `switch-background`, `ring`.

3. Enable dark mode with a `dark` class variant on the root element if the application supports dark mode.

Product-specific logic stays in the application: map domain statuses to `StatusPresentation` before
rendering, and wrap `ErrorState` to pass `formatErrorMessage` and `showErrorDetails` (the package reads no
bundler globals such as `import.meta.env`).

## Development

```bash
npm install
npm run check   # lint, typecheck, build, tests, package contract, packed exports
```

- `npm test` runs vitest, `scripts/check-package-contract.mjs` (no router, SDK, application-layer imports or
  bundler globals; React-free control-state core) and `scripts/check-packed-exports.mjs` (packs the tarball,
  installs it in a temporary consumer and imports every entry).
- Test changes in an application with `npm pack` and install the tarball there; never commit a `file:`
  dependency.

## Release

1. Update `version` in `package.json` and `CHANGELOG.md`.
2. Create a GitHub release `vX.Y.Z`; `.github/workflows/publish.yml` publishes to npm.

Published versions are never republished; fix forward with a new patch version.

## License

MIT
