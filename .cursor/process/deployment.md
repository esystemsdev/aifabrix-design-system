# @aifabrix/ui release process

Development flows through a feature branch → `release/aifabrix-ui-X.Y.0` → PR → `main` → GitHub Release → npm.

| Step              | Owner / command                                            | Result                                                                  |
| ----------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Prepare version   | [/repair-release](../commands/repair-release.md)           | Validated version and changelog on the feature branch                   |
| Stage release     | [/push-release-branch](../commands/push-release-branch.md) | Feature commit pushed to the release branch; CodeQL evidence and PR URL |
| Approve promotion | Human reviewer                                             | PR merged into `main` with a merge commit                               |
| Publish           | [/push-github](../commands/push-github.md)                 | Immutable annotated tag, GitHub Release, verified npm publication       |

The release branch patch component is always zero: `0.2.0` through `0.2.x` use `release/aifabrix-ui-0.2.0`. Derive the line from the intended package version. A release push does not change the feature branch upstream.

`/push-release-branch` prepares a version when needed or reuses `/repair-release` output. Retries reuse the prepared unpublished version. Publication uses the approved release SHA already present in `main`, rather than whichever commit is latest on `main`.

Release branch pushes do not publish packages. The manual CodeQL workflow scans the release tip; publishing a GitHub Release triggers `publish.yml`. Keep branch protections configured to require PR review for `main`; command instructions do not configure GitHub repository settings.

Fix release findings on the feature branch, then push and scan the updated release branch. New SHAs invalidate prior evidence. Bring release fixes back into the feature branch before the next promotion. Never force-push release history or replace published tags or npm versions. Transient publication failures may retry the same run after confirming the package is absent; content fixes require a new version through the same PR process.
