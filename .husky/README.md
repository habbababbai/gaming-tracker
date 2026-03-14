# Husky - Git Hooks

Husky sets up git hooks to enforce code quality before commits and pushes.

## What It Does

### Pre-commit Hook (`pre-commit`)
Runs **before** each commit:
- ✅ Checks code formatting with `bun run format --check`
- ✅ Runs linting with `bun run lint`
- ✅ Runs TypeScript type check if configured

**If any check fails:**
- ❌ Commit is blocked
- 💬 Error message tells you what to fix
- 🔧 Run `bun run format` or `bun run lint:fix`

### Prepare-commit-msg Hook (`prepare-commit-msg`)
Runs **before** commit message editor opens:
- 💡 Reminds you to use `[SCOPE] - Description` format
- Adds helpful comment to commit message template

---

## Setup Instructions

### 1. Install Husky

```bash
bun install husky --save-dev
bun exec husky install
```

### 2. Make Hooks Executable

```bash
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg
```

### 3. Test It

Try committing bad code:
```bash
# This should FAIL
bun run build --bad-flag
git add .
git commit -m "test"
# ❌ Pre-commit hook will block it
```

Try with proper code:
```bash
# Fix the code
bun run format
git add .
git commit -m "[BE] - Fix formatting"
# ✅ Commit succeeds
```

---

## What Happens When Hooks Block a Commit

### Scenario: Linting fails

```
$ git commit -m "[BE] - Add feature"
🔍 Running pre-commit checks...
📋 Checking code formatting...
✅ Formatting OK
🔨 Running lint checks...
❌ Lint errors found. Run: bun run lint:fix
```

**Fix it:**
```bash
bun run lint:fix
git add .
git commit -m "[BE] - Add feature"
# ✅ Now it works
```

### Scenario: Formatting issues

```
$ git commit -m "[WEB] - Update style"
🔍 Running pre-commit checks...
📋 Checking code formatting...
❌ Formatting issues found. Run: bun run format
```

**Fix it:**
```bash
bun run format
git add .
git commit -m "[WEB] - Update style"
# ✅ Now it works
```

---

## Bypass Hooks (Not Recommended!)

**If you absolutely must skip hooks:**
```bash
git commit --no-verify
```

⚠️ **But:** GitHub CI will still catch the issues. Better to fix locally.

---

## For Your Team

When teammates clone the repo:

1. They run `bun install` (installs husky)
2. Husky auto-hooks git if installed
3. They're protected by pre-commit checks

---

## Troubleshooting

### Hooks not running

```bash
# Reinstall husky
bun exec husky install

# Make sure hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg

# Verify
ls -la .husky/
# Should show: -rwxr-xr-x (with x = executable)
```

### "permission denied" error

```bash
# Make hook executable
chmod +x .husky/pre-commit
```

### Hook runs but output is confusing

The hook will tell you exactly what to run:
- `bun run format` - fixes formatting
- `bun run lint:fix` - fixes linting issues
- `bun run type-check` - shows type errors

---

## What Checks Run

| Check | Why | Fix Command |
|-------|-----|------------|
| Formatting | Code style consistency | `bun run format` |
| Linting | Code quality, best practices | `bun run lint:fix` |
| Types | TypeScript errors | `bun run type-check` |

---

## Next: GitHub Actions

The `.github/workflows/ci.yml` does the **same checks on GitHub**:
- When you push to remote
- In pull requests
- Blocks merging if checks fail

**Local hooks** catch issues early.
**GitHub Actions** catch anything missed.

Both working together = clean, high-quality code!

