# Code Quality Setup Checklist

Follow these steps to fully activate code quality checks.

---

## ✅ Already Configured (Just Need to Install)

### 1. Pre-commit Hooks (Local)

```bash
# Install husky
bun install husky --save-dev
bun exec husky install

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg

# Test it
git commit -m "[BE] - Test commit"
# Should see: ✅ All pre-commit checks passed!
```

**What it does:**
- ✅ Prevents committing code that fails linting
- ✅ Prevents committing code that fails formatting
- ✅ Checks TypeScript types
- ❌ Blocks commit if any check fails

**Status:** 📦 Ready to install

---

### 2. GitHub Actions CI Pipeline

**File:** `.github/workflows/ci.yml`

**What it does:**
- ✅ Runs lint check on every push/PR
- ✅ Checks formatting
- ✅ Runs TypeScript type check
- ✅ Runs unit tests
- ✅ Security vulnerability scan
- ✅ Build check
- ❌ Blocks PR merge if critical checks fail

**Status:** ✅ Already configured, auto-runs on push

**To verify:**
1. Push to GitHub
2. Go to **Actions** tab
3. Should see "CI - Code Quality Checks" workflow
4. All jobs should pass ✅

---

### 3. PR Validation

**File:** `.github/workflows/validate-pr-title.yml`

**What it does:**
- ✅ Checks PR title format: `[SCOPE] - Description`
- ❌ Blocks if format is wrong
- 💬 Auto-comments with examples

**Status:** ✅ Already configured

---

## 🔧 Optional: GitHub Branch Protection

Prevents merging until all checks pass.

### Step 1: Go to GitHub Settings

1. Open repo on GitHub
2. **Settings** → **Branches**
3. Click **Add rule**

### Step 2: Configure Rule

**Branch name pattern:** `main`

**Enable these:**

```
☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging

Select status checks to require:
  ☑ Lint and Format / lint-and-format
  ☑ Validate PR Title / validate-title
  ☑ CI - Code Quality Checks / ci-summary
  (Optional: Type Check, Tests, Security, Build)
```

**Enable:**
```
☑ Dismiss stale pull request approvals when new commits are pushed
```

### Step 3: Save

Click **Create** or **Update**

**Result:** Can't merge unless all checks pass + 1 approval

**Status:** 🔧 Optional (recommended for learning)

---

## 📋 Verify Everything Works

### Test 1: Local Pre-commit Hook

```bash
# Create a file with bad code
echo "const x = 1" > test.ts

# Try to commit
git add test.ts
git commit -m "[BE] - Test"

# Expected:
# 🔍 Running pre-commit checks...
# 🔨 Running lint checks...
# ❌ Lint errors found. Run: bun run lint:fix
# (Commit blocked ✅)

# Clean up
rm test.ts
```

### Test 2: GitHub Actions

```bash
# Push to GitHub
git push origin main

# Go to Actions tab
# Should see "CI - Code Quality Checks" running
# All jobs should pass ✅
```

### Test 3: PR Title Validation

1. Create a test PR with title: `Update something`
2. Go to PR
3. Check "Checks" tab
4. Should see: ❌ Validate PR Title failed
5. Edit PR title to: `[BE] - Update something`
6. Should see: ✅ Validation passed

---

## 🚀 Quick Setup (5 minutes)

For **local pre-commit hooks only** (recommended for learning):

```bash
# 1. Install husky
bun install husky --save-dev
bun exec husky install

# 2. Make executable
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg

# 3. Test it
git commit -m "[BE] - Test"

# Done! You're protected locally.
# GitHub Actions already running automatically.
```

---

## 🏆 Full Setup (15 minutes)

For **all layers** (recommended):

```bash
# 1. Install husky
bun install husky --save-dev
bun exec husky install
chmod +x .husky/*

# 2. Push to GitHub
git add .
git commit -m "[CONFIG] - Setup code quality checks"
git push origin main

# 3. Setup branch protection (in GitHub UI)
# Settings → Branches → Add rule → main
# (See section above)

# Done! All 3 layers active:
# ✅ Local hooks
# ✅ GitHub Actions
# ✅ Branch protection
```

---

## 📊 What Gets Checked

| Check | Where | Blocks Commit? | Blocks Merge? |
|-------|-------|---|---|
| **Formatting** | Local + CI | ✅ Yes | ✅ Yes |
| **Linting** | Local + CI | ✅ Yes | ✅ Yes |
| **Type Check** | CI only | ❌ No | 🔄 Optional |
| **Tests** | CI only | ❌ No | 🔄 Optional |
| **Security** | CI only | ❌ No | 🔄 Optional |
| **PR Title** | CI only | ❌ No | ✅ Yes |
| **Build** | CI only | ❌ No | 🔄 Optional |

---

## 🔄 Typical Developer Workflow

```
1. Write code
   ↓
2. git add .
   ↓
3. git commit -m "[BE] - Feature"
   ↓
   Pre-commit hook runs:
   - Format check ✅
   - Lint check ✅
   - Type check ✅
   ↓
4. Commit succeeds! Code is locally validated
   ↓
5. git push origin branch
   ↓
   GitHub Actions run:
   - Lint & Format ✅
   - Type check ✅
   - Tests ✅
   - Security ✅
   - Build ✅
   ↓
6. Create PR with title: [BE] - Feature
   ↓
   Validations:
   - PR title ✅
   - Checks ✅
   ↓
7. Get code review + approval ✅
   ↓
8. All checks pass → Merge! ✅
```

---

## 🐛 Troubleshooting

### Pre-commit hook not running

```bash
# Reinstall
bun exec husky install

# Check permissions
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x (x = executable)

# If not executable:
chmod +x .husky/pre-commit
```

### "Command not found: bun"

```bash
# Make sure bun is installed
bun --version

# Or install it
curl -fsSL https://bun.sh/install | bash
```

### "Lint error but can't figure out how to fix"

```bash
# Get auto-fix
bun run lint:fix

# If still issues, see errors
bun run lint

# Check linter config: .eslintrc, tsconfig.json
```

### GitHub Actions not running

```bash
# Wait 5-10 minutes for first activation
# Then go to Actions tab

# If still not showing:
1. Check repo has .github/workflows/ folder
2. Verify file is .github/workflows/ci.yml
3. Try pushing again
```

### Can't merge PR

Check which status check failed:
1. Go to PR
2. Click "Checks" tab
3. See which one failed (red X)
4. Click failing check for details
5. Run suggested fix command locally

---

## 📚 Documentation Files

- **Local Hooks:** `.husky/README.md`
- **Full Setup:** `.github/CODE_QUALITY_SETUP.md`
- **Contributing:** `CONTRIBUTING.md`
- **PR Validation:** `.github/SETUP_GUIDE.md`

---

## Next Steps

1. **Install locally:** `bun install husky --save-dev && bun exec husky install`
2. **Test it:** Try committing code with bad linting
3. **Optional:** Setup branch protection in GitHub UI
4. **Celebrate:** Your repo is now protected! 🎉

---

**Questions?** See detailed docs or check GitHub Actions logs for specific errors.

