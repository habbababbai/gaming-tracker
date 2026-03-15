# Code Quality Setup Guide

This guide explains all the quality checks we've set up to keep the repo clean and professional.

---

## 🎯 Overview

We have **3 layers** of quality checks:

```
Layer 1: Local (Your Computer)
└─ Pre-commit hooks (Husky)
   ├─ Format check
   ├─ Lint check
   └─ Type check

Layer 2: Remote (GitHub)
└─ GitHub Actions CI Pipeline
   ├─ Lint & format
   ├─ Type checking
   ├─ Unit tests
   ├─ Security scan
   └─ Build check

Layer 3: Branch Protection
└─ Prevent merging until:
   ├─ All checks pass
   ├─ 1 approval received
   └─ PR title valid
```

---

## Layer 1: Local Pre-commit Hooks (Husky)

**What:** Runs checks before you commit code locally.

**Why:** Catch issues early, never commit bad code.

### Setup

```bash
# Install husky
bun install husky --save-dev
bun exec husky install

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg
```

### What It Checks

```
📋 Formatting → Code style consistent
🔨 Linting    → No warnings or errors
🎯 Types      → No TypeScript errors
```

### When You Commit

```bash
$ git commit -m "[BE] - Add feature"

# Husky runs checks...
🔍 Running pre-commit checks...
📋 Checking code formatting... ✅
🔨 Running lint checks...      ✅
🎯 Checking TypeScript types... ✅
✅ All pre-commit checks passed!

# Commit succeeds!
```

### If Checks Fail

```bash
❌ Formatting issues found. Run: bun run format

# Fix it
bun run format
git add .
git commit -m "[BE] - Add feature"
# ✅ Now it works
```

**See:** [.husky/README.md](.husky/README.md) for details

---

## Layer 2: GitHub Actions CI Pipeline

**What:** Automated checks when you push to GitHub or create a PR.

**Why:** Catch issues that slipped through local checks, ensure consistency.

**File:** `.github/workflows/ci.yml`

### What It Checks

```
1. Lint & Format (REQUIRED)
   ├─ Linting: bun run lint
   └─ Formatting: bun run format --check

2. Type Checking
   └─ TypeScript: bun run type-check

3. Tests
   └─ Jest/Vitest: bun test

4. Security
   └─ Dependencies: bun audit

5. Build
   └─ Build check: bun run build
```

### When It Runs

- ✅ On pull requests to `main` or `develop` (skips when only .md/docs change)
- ✅ All jobs run in parallel for speed

### Example: Failed Lint in PR

```
Your PR fails the lint check:

❌ Lint Check Failed
   Error: 'unused variable' at line 42

→ GitHub shows failing status
→ You can't merge until fixed
→ Auto-comment links to fix command: bun run lint:fix
```

**How to view results:**
1. Go to PR
2. Click "Checks" tab
3. See all job results
4. Click failing job for details

---

## Layer 3: Branch Protection Rules

**What:** GitHub prevents merging unless all checks pass.

**Why:** Ensures `main` branch always has working, quality code.

### Setup in GitHub

1. Go to **Settings → Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable these:

```
☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed

☑ Require status checks to pass before merging
  Select these checks:
  - Lint & Format (REQUIRED)
  - Validate PR Title
  - (Optional) Type Check, Tests, Build, Security

☑ Require branches to be up to date before merging
```

### What This Means

```
To merge a PR, MUST have:
✅ Valid PR title: [BE] - Description
✅ 1 approval from another person
✅ Lint check passing
✅ Format check passing
✅ Branch up-to-date with main

If ANY fails:
❌ Merge button is disabled
💬 Shows which checks failed
🔧 Instructions to fix
```

---

## Complete Workflow Example

### Step 1: Developer Creates Feature

```bash
git checkout -b [be]/add-feature
# ... write code ...
```

### Step 2: Commit Code

```bash
git commit -m "[BE] - Add awesome feature"

# Husky runs locally:
# ✅ Format check passed
# ✅ Lint check passed
# ✅ Type check passed
# ✅ Commit succeeded!
```

### Step 3: Push to GitHub

```bash
git push origin [be]/add-feature

# GitHub Actions start:
# ✅ Lint & Format
# ✅ Type Checking
# ✅ Tests
# ✅ Security
# ✅ Build
# All passed!
```

### Step 4: Create Pull Request

```
Title: [BE] - Add awesome feature
Description: What changed and why
```

### GitHub Checks Run

```
✅ Validate PR Title
   → Title follows [SCOPE] - Description

✅ CI - Code Quality Checks
   → Lint, format, types, tests all pass

✅ Branch up to date
   → No conflicts with main
```

### Step 5: Code Review

```
Someone reviews and approves:
✅ 1 approval received
```

### Step 6: Merge

```
All checks passed:
✅ Valid PR title
✅ CI pipeline passed
✅ Code reviewed
✅ Branch up-to-date

→ Merge button enabled
→ Can merge!
```

---

## What Can Block Merging

```
❌ Lint fails
   Fix: bun run lint:fix

❌ Format fails
   Fix: bun run format

❌ Tests fail
   Fix: Update tests or code

❌ Type errors
   Fix: bun run type-check (see errors)

❌ PR title invalid
   Fix: Edit title to: [SCOPE] - Description

❌ No approvals
   Fix: Wait for code review

❌ Branch out of date
   Fix: git pull origin main, resolve conflicts
```

---

## For Your Team

### New Contributor Setup

```bash
# Clone repo
git clone ...
cd gaming-tracker

# Install dependencies (includes husky)
bun install

# Husky installs git hooks automatically!
# They're now protected by pre-commit checks
```

### Teammate Runs into Blocked Commit

They'll see:
```
❌ Lint errors found. Run: bun run lint:fix
```

They fix it:
```bash
bun run lint:fix
git add .
git commit -m "[WEB] - Fix styling"
# ✅ Works!
```

---

## Fixing Code Quality Issues

### Format Issues

```bash
bun run format
git add .
git commit -m "[BE] - Format code"
```

### Lint Issues

```bash
bun run lint:fix        # Auto-fixes what it can
bun run lint            # See remaining issues
# ... fix manually ...
git add .
git commit -m "[BE] - Fix linting"
```

### Type Errors

```bash
bun run type-check      # See errors
# ... fix types in code ...
git add .
git commit -m "[BE] - Fix types"
```

### Test Failures

```bash
bun test                # See failures
# ... fix code or tests ...
git add .
git commit -m "[BE] - Fix tests"
```

---

## Recommended Settings for Learning Project

```
Layer 1: Local (Husky)
├─ ✅ REQUIRED - Prevents bad commits
└─ Auto-installs with bun install

Layer 2: CI/CD (GitHub Actions)
├─ ✅ Format check - REQUIRED
├─ ✅ Lint check - REQUIRED
├─ ✅ PR title validation - REQUIRED
├─ 🔄 Tests - Run but don't block (yet)
└─ 🔄 Type check - Run but don't block (yet)

Layer 3: Branch Protection
├─ ✅ Require PR
├─ ✅ Require 1 approval
├─ ✅ Require status checks (lint, format, title)
└─ ✅ Require up-to-date branch
```

---

## Dashboard / Monitoring

### GitHub Actions Dashboard

- Go to **Actions** tab
- See all workflow runs
- Click on any run to see details
- Click on failing job for full logs

### Branch Protection Status

- Go to **Settings → Branches → main**
- See all protection rules
- See which checks are required

---

## Questions?

- **Local hooks not working?** → See [.husky/README.md](.husky/README.md)
- **CI pipeline failing?** → Check GitHub Actions logs
- **Can't merge PR?** → See which status check failed, fix it
- **Contributing rules?** → See [../CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Summary

✅ **We have 3 layers protecting code quality:**
1. Local pre-commit checks (catches 95% of issues)
2. GitHub Actions CI (catches anything missed locally)
3. Branch protection (prevents merging broken code)

✅ **Result:** Clean, consistent, high-quality codebase

✅ **For learning project:** Perfect balance of automation and learning

