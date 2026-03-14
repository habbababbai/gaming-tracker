# GitHub Configuration

This directory contains GitHub-specific configuration files for the Gaming Tracker project.

---

## 📂 Files

### Workflows
- **`workflows/validate-pr-title.yml`** - Validates PR titles follow `[SCOPE] - Description` format
  - Runs automatically on PR creation/edit
  - Auto-comments with feedback
  - No configuration needed

### Templates
- **`pull_request_template.md`** - Auto-populated when creating PRs
  - Checklist for naming convention
  - Scope selection
  - Testing confirmation

- **`ISSUE_TEMPLATE/feature_request.md`** - Auto-populated for feature requests
- **`ISSUE_TEMPLATE/bug_report.md`** - Auto-populated for bug reports

### Guides
- **`SETUP_GUIDE.md`** - Detailed GitHub configuration instructions
  - What works automatically
  - Optional repository settings
  - Step-by-step setup
  - Troubleshooting

- **`PR_VALIDATION_QUICK_START.md`** - Quick reference guide
  - TL;DR version
  - Testing instructions
  - FAQ

---

## 🚀 Quick Start

### 1. Everything Works Automatically
Just push the files:
```bash
git push origin main
```

The workflow validates every PR title automatically. No setup needed!

### 2. Test It
1. Create PR with title: `Update something`
   - ❌ Validation fails
   - 💬 Auto-comment shows how to fix

2. Edit title to: `[BE] - Update something`
   - ✅ Validation passes

### 3. Optional: Enforce Rules (Recommended)
If you want to prevent merging without proper titles:
1. Go to **Settings → Branches → Add rule**
2. Pattern: `main`
3. Enable: "Require status checks to pass"
4. Select: `Validate PR Title / validate-title`

---

## 📋 Valid PR Title Examples

```
[BE] - Add password reset endpoint
[WEB] - Create game collection UI
[MOBILE] - Implement search screen
[BE, WEB] - Update user response types
[BE, WEB, MOBILE] - Update shared types
[TYPES] - Add UserGameResponse interface
[DOCS] - Update API documentation
[CONFIG] - Setup GitHub Actions
```

---

## ❓ Do I Need to Do Anything?

**Minimum:** Just push the files. Validation works automatically.

**Recommended:** Setup branch protection to enforce it.

See `SETUP_GUIDE.md` for detailed instructions.

---

## 📚 Full Documentation

- Main guidelines: `../../CONTRIBUTING.md`
- Setup instructions: `SETUP_GUIDE.md`
- Quick reference: `PR_VALIDATION_QUICK_START.md`

