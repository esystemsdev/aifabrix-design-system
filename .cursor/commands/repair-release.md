# repair-release

**Release flow:** Prepare on the current feature branch, then use [/push-release-branch](push-release-branch.md) to stage `release/aifabrix-ui-X.Y.0` and obtain a PR to `main`. After a human merge, [/push-github](push-github.md) publishes. See [deployment process](../process/deployment.md). This command only prepares local files. It does not commit, push, tag, or publish.

**Resume rule:** When invoked by `/push-release-branch`, reuse an already prepared unpublished version with a matching changelog instead of bumping twice. An explicit standalone request for a new release still performs the change analysis below.

When `/repair-release` is used, prepare the package by running validation, analyzing changes, updating the changelog, and incrementing the version. Work without asking for input.

## Execution

1. **Validation.** Run [/validate-tests](validate-tests.md) (`npm run check`). Do not continue while it fails.

2. **Change detection.** Take the last published version from reachable `v*` tags, corroborated by a GitHub Release and `npm view @aifabrix/ui@<version>`. A tag alone is not proof of publication. Compare `HEAD` with that tag:

   ```bash
   git log <last-tag>..HEAD --oneline
   git diff <last-tag>..HEAD --name-status
   ```

3. **Version.** Read `version` from the root `package.json`. While the package is `0.x`:
   - **Patch** (`0.2.0` → `0.2.1`): bug fixes, ref forwarding fixes, tests, docs-only edits, dependency-range corrections, refactors without a new public option.
   - **Minor** (`0.2.0` → `0.3.0`): new components, new optional props, or other additive public behavior.
   - **Major** (`0.x` → `1.0.0`, or a breaking public change): do not apply automatically. Stop and ask. Published npm versions are immutable, so never reuse a version that `npm view` already resolves.

4. **Changelog.** Read `CHANGELOG.md` and add the new version at the top in the format this file already uses:

   ```markdown
   ## X.Y.Z

   - One bullet per user-visible change.
   ```

   Do not switch this repository to the Miso Client `## [X.Y.Z] - YYYY-MM-DD` headings. Keep the existing `## X.Y.Z` heading and flat bullets.

5. **package.json.** Set `version` to the calculated number. Preserve JSON formatting.

6. **Check.** Confirm `package.json` and the top `CHANGELOG.md` heading are the same version, and that `npm view @aifabrix/ui@<version>` is not found. Network or authentication errors are blockers, not proof that the version is free.

## Done when

- `npm run check` passed before the edits.
- The version increment matches the changes since the last published tag.
- `CHANGELOG.md` has the new `## X.Y.Z` entry.
- `package.json` `version` matches that entry.
- Nothing was committed, pushed, tagged, or published.
