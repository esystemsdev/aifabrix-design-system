# push-release-branch

Promote the current feature branch to `release/aifabrix-ui-{major}.{minor}.0`, validate it, run CodeQL, and open a PR to `main` for human review.

**Repo:** `aifabrix-design-system` root only. **Process:** [deployment](../process/deployment.md).

## Modes and authorization

- `/push-release-branch`: show the concrete release plan, then confirm release preparation, commit/push, and PR creation as needed.
- `/push-release-branch silent`: one confirmation covers the disclosed sync, version preparation, validation, scoped commit, release-branch push, and CodeQL dispatch. PR creation is a separate final decision unless the user explicitly authorizes it.

Honor existing session authorization. Use an available question tool for missing authorization, or numbered choices in chat. Show exact files, version, source and target refs, and actions before asking. A decline stops that action. `silent` reduces confirmation windows. It does not skip validation or progress reporting.

This command does not tag, publish, merge PRs, or push to `main`. Publication follows human review through [/push-github](push-github.md).

## 0. Readiness and plan

```bash
git branch --show-current
git status --short --branch
git fetch --prune origin
git branch -r --list 'origin/release/aifabrix-ui-*'
```

1. Record the repository, original source branch, upstream, ahead/behind, and dirty or untracked files. Detached HEAD or `main` is blocked. A release branch as source requires an explicit maintenance request. The normal source is the current feature branch. This repository has no long-lived `dev` branch.
2. Identify relevant uncommitted work. Exclude unrelated files, credentials, and `.temp/`. Never stash, discard, or commit unrelated work. Resolve unsafe upstream divergence before proceeding.
3. Read root `package.json` and `CHANGELOG.md`. Reuse an already prepared unpublished version with a matching changelog. Otherwise propose a version using `/repair-release` change analysis. Only an explicit npm version-not-found response establishes availability. Network or authentication failures are blockers.
4. Derive the target from the intended version: `0.2.4` maps to `release/aifabrix-ui-0.2.0`; `0.3.0` maps to `release/aifabrix-ui-0.3.0`. Parse release lines numerically by major and minor. Report the latest line, and do not merge another version line into a maintenance release.
5. Check target existence and ancestry relative to the source. Inspect `origin/main` for missing release fixes and include a required sync in the plan.
6. Verify GitHub and npm access and the existing `codeql-manual.yml` and `publish.yml` workflows. CodeQL uses manual dispatch. Publishing uses `release: published`. A push to the release branch does not publish npm.
7. Show source, target, current version, intended version, scoped files, validation, push refspec, CodeQL dispatch, and PR intent. Obtain any missing authorization.

## 1. Synchronize and prepare

Merge the target release branch into the source when that is needed to keep release fixes. Bring missing `main` fixes back into the source as disclosed. Resolve conflicts without dropping intended changes. Stop if the correct resolution needs a decision.

Re-read metadata after synchronization. If the version, target, or approved actions change, show the revised plan before any external action.

Run [/repair-release](repair-release.md) only when preparation is needed. Reuse its version and changelog. Do not bump twice on retries.

## 2. Validate and commit

Run [/validate-tests](validate-tests.md) (`npm run check`). Repair relevant failures and repeat until it exits 0. Show the lint, typecheck, build, and test result.

Review the final diff, stage the explicit relevant paths, and commit the validated release work under the applicable authorization. Never stage the whole tree. Record `releaseSha`.

## 3. Push the release branch

Fetch again and require the remote target, if it exists, to be an ancestor of `releaseSha`. If it advanced incompatibly, synchronize and validate again.

```bash
git push origin "${sourceBranch}:${releaseBranch}"
git fetch --prune origin
```

This creates or updates the release branch without changing the source upstream. Never force-push. Require the source HEAD and the fetched remote release tip to both equal `releaseSha`.

For local visibility, create a missing local release branch that tracks origin. If it already exists, fast-forward it with `git merge --ff-only` and return to the source branch. If it has diverged or is checked out in another worktree, report that instead of resetting it. Leave the original source branch checked out.

## 4. CodeQL on the release commit

```bash
gh workflow run codeql-manual.yml --ref "$releaseBranch"
```

Identify the dispatched run by workflow, branch, event, dispatch time, and `headSha == releaseSha`. Monitor that run id and record its URL. Download its artifacts:

```bash
gh run download "$runId" -n codeql-actions-sarif -D ".temp/codeql/$runId/actions"
gh run download "$runId" -n codeql-javascript-typescript-sarif -D ".temp/codeql/$runId/javascript-typescript"
```

Require both artifacts, valid nonempty SARIF runs, a successful workflow, and zero `runs[].results[]` findings. Missing output is not a clean scan. Repair findings on the source branch, validate, commit, and push through the same release path, then scan the new SHA. A changed release tip invalidates previous evidence.

## 5. Pull request to main

Verify the remote release tip still equals the validated and scanned SHA. Show base `main`, head, version, SHA, scan URL, title, and any existing PR. Obtain the PR decision if it is not already authorized. `silent` approval alone does not authorize creating the PR.

```bash
gh pr list --base main --head "$releaseBranch" --state open
```

Reuse an existing open PR. Otherwise write `.temp/release-pr.md` with the changes, version, SHA, validation evidence, CodeQL URL, and review checklist, then:

```bash
gh pr create --base main --head "$releaseBranch" --title "Release @aifabrix/ui $version" --body-file .temp/release-pr.md
```

Return the PR URL. Reviewers merge with a **merge commit**, so the scanned SHA stays in `main`. This command never merges. After the merge, `/push-github` publishes.

## Completion

Report source, target, version, verified SHA, validation and CodeQL evidence, local release-pointer status, and the review URL. Preserve the original checkout. If a check fails, report the blocker. Publication stays pending until a human merge and `/push-github`.
