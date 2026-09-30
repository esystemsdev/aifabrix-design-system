# Control-state public contract

`@/shared/control-state` is the public entry point for the portable, pure
TypeScript presentation-state package shape.

## Dependency law

Source in this directory must not import React, DOM APIs, Dataplane auth/hooks,
API services, routes, feature models, application configuration, or permission
names. Consumers must not deep-import internal files.

## Compatibility

- State objects are immutable discriminated unions.
- Adding a new optional scenario is minor-compatible.
- Removing/renaming a state, reason source, family, or public export is breaking.
- Invalid family combinations must be rejected by TypeScript or a public
  validation/factory function.
- Reasons contain neutral codes/messages/sources, never project permission IDs.

## Responsibility

The package describes resolved presentation state. It does not decide whether a
user has a permission and does not replace backend authorization.

Normative semantics and precedence:
`docs/development/ui-control-state-architecture.md`.
