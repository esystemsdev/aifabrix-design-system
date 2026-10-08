# validate-tests

When `/validate-tests` is used, fix failures and repeat until the design-system gate is green. Work without asking for input.

The gate is the repository check, not the Miso Client silent scripts:

```bash
npm run check
```

That runs lint, typecheck, build, vitest, the package contract, and the packed-export install.

## Execution

1. Run `npm run check` from the repository root.
2. If it fails, fix the cause in source, tests, or package metadata. Re-run `npm run check`.
3. Repeat until the command exits 0.

## Rules

- Do not weaken ESLint rules, raise warning thresholds, or add `eslint-disable` comments to hide a failure.
- Do not skip `prepublishOnly` checks by publishing around `npm run check`.
- Do not treat a partial script (`npm test` alone, `npm run lint` alone) as the completed gate.
- The command is complete only when `npm run check` exits 0.
