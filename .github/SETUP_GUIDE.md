# GitHub Setup Guide - PR Naming Convention

Instructions for setting up the PR naming convention validation in your GitHub repository.

---

## ✅ What Works Automatically (No Setup Required)

Once you push the workflow file to GitHub, these things work automatically:

1. **GitHub Action Validation**
   - `validate-pr-title.yml` runs on every PR creation/edit
   - ✅ Checks if PR title matches `[SCOPE] - Description`
   - ✅ Auto-comments with feedback if title is invalid
   - ✅ Shows examples and valid scopes
   - ✅ No configuration needed - just push the file!

2. **PR Template**
   - `.github/pull_request_template.md` auto-populates when creating PR
   - Shows checklist including title validation reminder
   - No configuration needed - just push the file!

3. **Issue Templates**
   - Feature request and bug report templates auto-populate
   - No configuration needed - just push the files!

---

## 🔧 Optional GitHub Repository Settings (Recommended)

These settings enhance the workflow but aren't required. They help with code quality:

### 1. **Branch Protection Rules** (Recommended for Learning)

Protects the `main` branch:

**Steps:**
1. Go to **Settings → Branches**
2. Click **Add rule**
3. Fill in branch name pattern: `main`
4. Enable these:

```
☑ Require a pull request before merging
  ☑ Require approvals: 1 (or more)

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging

☑ Require code reviews before merging
☑ Dismiss stale pull request approvals when new commits are pushed
```

**Why:** Ensures PRs are reviewed and validated before merging

---

### 2. **GitHub Actions Permissions** (Public Repo)

For public repos, this is usually already set, but verify:

**Steps:**
1. Go to **Settings → Actions → General**
2. Under "Workflow permissions":
   ```
   ☑ Read and write permissions
   ☑ Allow GitHub Actions to create and approve pull requests
   ```

3. Under "Fork pull request workflows":
   ```
   ☑ Run workflows from fork pull requests
   (Allows contributors to run actions on their forks)
   ```

**Why:** Allows the workflow to comment on PRs and post status

---

### 3. **Require PR Titles to be Valid** (Optional - Most Important!)

This is the key setting for enforcing the naming convention:

**Steps:**
1. Go to **Settings → Branches → main**
2. Under "Require status checks to pass before merging":
   - Enable this checkbox
   - Search for: `validate-title` (the job name from our workflow)
   - Select: `Validate PR Title / validate-title`
   - Check the box to require it

```
☑ Require status checks to pass before merging
  ☑ Validate PR Title / validate-title
```

**Why:** Prevents merging until PR title is validated

**Note:** This job might not appear immediately after first push. It appears once the workflow runs for the first time.

---

### 4. **Enable PR Auto-merge** (Optional - For Learning)

Allows quick merges once approved:

**Steps:**
1. Go to **Settings → Pull Requests**
2. Enable:
   ```
   ☑ Allow auto-merge
   ```

**Why:** Developers can auto-merge once approved (learning project feature)

---

## 📋 Step-by-Step Setup Checklist

### Before Pushing Changes

- [ ] Workflow file created: `.github/workflows/validate-pr-title.yml`
- [ ] PR template created: `.github/pull_request_template.md`
- [ ] Issue templates created in `.github/ISSUE_TEMPLATE/`
- [ ] CONTRIBUTING.md created with guidelines

### After Pushing to GitHub

```bash
# Commit and push the files
git add .github/ CONTRIBUTING.md
git commit -m "[CONFIG] - Add PR naming convention validation"
git push origin main
```

### In GitHub Web UI

1. **Verify Action is Running:**
   - Go to **Actions** tab
   - Look for "Validate PR Title" workflow
   - Should show as "active"
   - ✅ If green: working!
   - ⚠️ If not there: wait 5-10 minutes, refresh

2. **Test It:**
   - Create a test PR with title: `Test PR`
   - Workflow should run and fail (red X)
   - Auto-comment should appear: "PR title does not follow naming convention"
   - Edit title to: `[BE] - Test PR`
   - Workflow should pass (green ✅)

3. **Setup Branch Protection (Recommended):**
   - Go to **Settings → Branches → Add rule**
   - Pattern: `main`
   - Enable: "Require status checks to pass before merging"
   - Select: `Validate PR Title / validate-title`
   - Save

---

## 🎓 For a Learning Project (Recommended Settings)

**Minimal Setup (Just the Action):**
- ✅ Push workflow file
- ✅ Test with a PR
- Done! Action validates automatically

**Better Setup (Add Branch Protection):**
- ✅ Push workflow file
- ✅ Enable branch protection on `main`
- ✅ Require PR reviews
- ✅ Require status checks (including our PR title validator)
- Result: Can't merge without proper title + review

---

## 🧪 Testing the Setup

### Test 1: Invalid PR Title
1. Create new branch: `git checkout -b test/invalid-title`
2. Make small change
3. Push and create PR with title: `Update something`
4. Expected:
   - ❌ Workflow fails (red X)
   - 💬 Auto-comment appears with error

### Test 2: Valid PR Title
1. Edit PR title to: `[BE] - Update something`
2. Expected:
   - ✅ Workflow passes (green ✓)
   - Comment appears: "PR title is valid"

### Test 3: Multiple Scopes
1. Edit PR title to: `[BE, WEB] - Update something`
2. Expected:
   - ✅ Workflow passes (green ✓)

---

## 🐛 Troubleshooting

### "I don't see the workflow in Actions tab"
- **Cause:** Workflow file not in repo yet, or wrong path
- **Fix:**
  - Check file is at `.github/workflows/validate-pr-title.yml`
  - Commit and push
  - Wait 5-10 minutes
  - Refresh GitHub

### "Workflow is disabled"
- **Cause:** GitHub Actions might be disabled for org
- **Fix:**
  - Go to **Settings → Actions → General**
  - Select "Allow all actions and reusable workflows"
  - Save

### "No auto-comment appears"
- **Cause:** Permissions might be restricted
- **Fix:**
  - Go to **Settings → Actions → General**
  - Check "Workflow permissions"
  - Enable "Allow GitHub Actions to create and approve pull requests"

### "The status check doesn't appear in branch protection"
- **Cause:** Workflow hasn't run yet
- **Fix:**
  - Create a test PR first
  - Let workflow run once
  - Then go back to branch protection
  - The `validate-title` check should appear

---

## 📝 Settings Summary Table

| Setting | Location | Required? | Purpose |
|---------|----------|-----------|---------|
| Workflow file | `.github/workflows/` | ✅ Yes | Validates PR titles |
| PR template | `.github/pull_request_template.md` | 🔄 Optional | Shows checklist |
| Issue templates | `.github/ISSUE_TEMPLATE/` | 🔄 Optional | Auto-fills issues |
| Branch protection | Settings → Branches | 🔄 Optional | Enforces reviews |
| Require status checks | Settings → Branches | 🔄 Optional | Blocks bad titles |
| Actions permissions | Settings → Actions | ✅ Needed if restricted | Allows comments |

---

## ✨ Public Repository Considerations

Since this is a **public learning project**:

**Good for contributors:**
- ✅ Clear naming conventions
- ✅ Automatic feedback
- ✅ Examples in PR template
- ✅ CONTRIBUTING.md has all info

**Recommended settings:**
1. Enable branch protection (`main`)
2. Require PR reviews (at least 1)
3. Require PR title validation
4. Allow all actions

**Not needed:**
- Restricted permissions (public projects benefit from open contributions)
- Complex review rules (learning project)
- Required status checks beyond validation

---

## 🚀 Quick Start (Minimal Setup)

**For fastest setup:**

1. Push all files to `main`:
   ```bash
   git add .github/ CONTRIBUTING.md
   git commit -m "[CONFIG] - Add PR validation"
   git push
   ```

2. Go to **Actions** tab - verify workflow exists

3. Create test PR - verify validation works

**Done!** The validation works automatically. Everything else is optional.

---

## 📚 Additional Resources

- GitHub Actions docs: https://docs.github.com/en/actions
- Branch protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- Workflow syntax: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

