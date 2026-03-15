# Changelog automation – flow and pitfalls

## How it works

1. **Trigger:** `.github/workflows/update-changelog.yml` runs when a **pull request targeting `main` is closed** and **merged** (`merged == true`). It does **not** run when the merged PR is the bot’s own (`head.ref != 'changelog-update'`).

2. **Checkout:** Workflow checks out **`main`** (with full history). So we see the repo state **after** the merge, including the merge commit.

3. **Commit range:** The workflow runs:
   ```bash
   bun run changelog:generate -- --since-commit ${{ github.event.pull_request.base.sha }}
   ```
   `base.sha` is the commit on `main` **before** this PR was merged. The script runs `git log base.sha..HEAD`, so it only sees commits that were **added by this merge** (that PR’s commits, or the squash commit). No “since last tag” or “last 50” – only this PR.

4. **Parsing:** `scripts/generate-changelog.js`:
   - Reads commits in that range.
   - Keeps only lines matching **`[SCOPE] - Description`** (e.g. `[BE] - Add X`). Others (e.g. `[DOCS]`, or no scope) are ignored.
   - Maps scopes to apps: `BE` → `apps/api`, `WEB` → `apps/web`, `MOBILE` → `apps/mobile`, `TYPES` → `packages/types`.
   - For each app that has at least one matching commit, **prepends** new entries under `## [Unreleased]` in that app’s `CHANGELOG.md` (single replace of the `## [Unreleased]` line with that line + new subsections). Only those apps are touched. **Deduplication:** existing bullet lines under `[Unreleased]` are read (normalized: trim + strip trailing `(#n)`); any new entry that already exists is skipped, so the same line is never added twice.

5. **Create PR:** If `git diff` is non-empty after the script, the workflow uses `peter-evans/create-pull-request` to commit changes and push to branch **`changelog-update`**. If a PR from that branch already exists, the action **updates** it (same PR, updated content). No duplicate PRs for the same branch.

6. **Concurrency:** The workflow uses `concurrency: group: changelog-update` with `cancel-in-progress: false`, so only one update-changelog run runs at a time. A second run (e.g. another merge) waits for the first to finish.

## Pitfalls and limitations

| Pitfall | Why it happens | Mitigation |
|--------|----------------|------------|
| **Same PR recreated with same content** | Not an issue with current design: we use a fixed branch `changelog-update`, so the action updates the existing PR. We only run on **merged** PRs and pass `--since-commit base.sha`, so we don’t re-process old commits. | — |
| **All apps’ changelogs updated when only one changed** | Fixed: we pass `--since-commit base.sha`, so only **this merge’s** commits are used. Only apps whose scope appears in those commits get entries. | — |
| **Duplicate entries / bloated [Unreleased]** | Each run **prepends** one block under `[Unreleased]`. The script **deduplicates**: it reads existing bullets under `[Unreleased]` (normalized: trim + strip trailing `(#n)`) and skips any new entry that’s already there. So re-runs or overlapping runs don’t add the same line twice. | Manually clean existing CHANGELOGs once if needed. |
| **Two PRs merged quickly – second overwrites first** | Run 1 creates/updates PR with PR-A’s entries. If Run 2 starts before the **changelog PR** is merged, Run 2 checks out `main` (which still doesn’t have Run 1’s changelog). It only adds PR-B’s entries and pushes to `changelog-update`, **overwriting** the branch. The open PR then shows only B’s entries; A’s are lost. | **Merge the changelog PR** before merging the next code PR when you merge often. Concurrency only serializes runs; it doesn’t preserve unmerged changelog content. |
| **Squash merge: single commit, wrong format** | Squash merge produces one commit. If its message doesn’t follow `[SCOPE] - Description` (e.g. default “PR #N”), the script parses nothing and writes no files → no changelog PR. | Use a squash commit message that matches the format, or rely on “Default to squash and merge” with a title that matches. |
| **Category “Added” vs “Changed”** | Category is inferred from **words** in the description (e.g. “add” → Added, “update” → Changed). So “add clinic to BE” correctly goes under Added. | Optional: tune `CATEGORY_MAP` / matching in `generate-changelog.js` if you want different rules. |

## What we do *not* do

- We do **not** run on every push to `main` (no duplicate runs from direct pushes or from merging the changelog PR).
- We do **not** run when the merged PR is the changelog bot’s PR.
- We do **not** run CI on changelog PRs (CI skips when only `.md` / docs change).
- We do **not** use “since last tag” or “last N commits” in the workflow; we always pass `--since-commit base.sha` so only the merged PR’s commits are used.

## Quick checks

- **Only one changelog PR at a time:** Branch is fixed `changelog-update`; the action updates that PR.
- **Only affected apps updated:** Script only writes to apps that have at least one commit in `base.sha..HEAD` with a matching scope.
- **No duplicate content from re-runs:** Each run uses only that merge’s commits; same merge re-run produces same diff and only updates the same PR.
