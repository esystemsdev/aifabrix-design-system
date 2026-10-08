# push-github

Publish `@aifabrix/ui` **after** the release pull request is reviewed and merged into `main`.

Run from the repository root. Follow [deployment process](../process/deployment.md). Use [/push-release-branch](push-release-branch.md) first to stage the feature branch and obtain the review URL. This command never merges, pushes to `main`, or bumps versions.

## 1. Verify the approved release

1. Fetch origin and tags. Record the original checkout and require a clean tree.
2. Identify the merged PR with base `main` and head `release/aifabrix-ui-X.Y.0`. Record its URL, approved head SHA, and merge SHA. If it is still open, return the review URL and stop.
3. Require the approved release head to be an ancestor of `origin/main`. Pull requests use merge commits so this ancestry holds. A squash or rebase needs reconciliation before publishing.
4. Read `package.json` and the matching top `CHANGELOG.md` entry at the approved release SHA. Derive `version` and `releaseTag=v{version}` there, not from the feature-branch checkout.
5. Verify successful CodeQL evidence with zero findings for that exact SHA, following `/push-release-branch`.
6. Check npm for the exact version. Only an explicit version-not-found response establishes availability. Network or authentication errors are blockers. If the version is already published, verify the existing release, tag, and workflow run, and report them instead of republishing.
7. Validate the release SHA in an isolated worktree with [/validate-tests](validate-tests.md) (`npm run check`). If validation changes tracked files, return the fixes through the feature branch and a new release PR before publishing.

## 2. Tag and publish the GitHub Release

Show the version, approved SHA, merged PR URL, validation evidence, and the npm publication action. Obtain publication approval unless this exact action is already authorized. Use a question tool if available, otherwise numbered choices in chat. Declining stops publication.

Inspect local and remote `v{version}` tags, including the peeled target of an annotated tag. An existing tag must be annotated and must resolve to the approved release SHA. Stop on a conflict. Fetch and verify an existing remote tag before reuse. Never move, delete, or force-update a tag.

Create a missing annotated tag on the approved release SHA, then push only that ref:

```bash
git tag -a "$releaseTag" "$releaseSha" -m "Release $releaseTag"
git push origin "refs/tags/${releaseTag}:refs/tags/${releaseTag}"
```

Run each mutation only when it is missing. Verify the remote peeled tag SHA equals `releaseSha`. Write `.temp/release-notes.md` with real newlines:

```text
## @aifabrix/ui v{version}

Shared AI Fabrix React UI primitives, status presentation and control-state.

### Installation
npm install --save-exact @aifabrix/ui@{version}

See the [commits](https://github.com/esystemsdev/aifabrix-design-system/commits/v{version}) for the changes.
```

Reuse an existing published GitHub Release for this tag. Inspect an existing draft and publish it only under publication authorization. Otherwise create a non-prerelease, non-draft release:

```bash
gh release create "$releaseTag" --verify-tag --title "Release $releaseTag" --notes-file .temp/release-notes.md
```

This publishes the approved commit already contained in `main`, even if `main` has moved ahead. Publishing the GitHub Release triggers `publish.yml`. Pushing a tag alone does not.

## 3. Monitor publication

- Find the `publish.yml` run for this release tag and SHA. Record its id and URL. Monitor that run. Do not pick an unrelated latest run.
- Require workflow success and npm resolving exactly `@aifabrix/ui@{version}`. Allow a short registry delay, and say when verification is still pending.
- On failure, read that run's logs and check whether npm publication already succeeded before retrying anything.
- For a transient failure with no published package, retry the same failed run after authorization. Do not dispatch against a moving `main` ref.
- A code or workflow fix needs a new version through `feature branch → release/aifabrix-ui-X.Y.0 → PR → main`. Never change an existing tag or a published npm version.

## Completion

Return the merged PR URL, release branch, version, approved SHA, tag, GitHub Release URL, publish run URL, and npm verification. Preserve the original checkout and remove only temporary worktrees created by this run when they are clean. Do not claim publication succeeded without registry evidence.
