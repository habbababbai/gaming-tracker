# Contributing to Gaming Tracker

Guidelines for code contributions, commit messages, and pull requests.

---

## Pull Request & Commit Naming Convention

All pull requests and commits must follow this pattern to maintain a clean, navigable history.

### Format

```
[SCOPE] - Brief description of changes
```

**Example PR/Commit titles:**
```
[BE] - Add password reset functionality
[WEB] - Create game collection page
[MOBILE] - Implement game search screen
[BE, WEB] - Update user game response types
[BE, WEB, MOBILE] - Update shared types package
[DOCS] - Update API documentation
```

### Scopes

Use **square brackets** with comma-separated scopes:

| Scope | Use When | Example |
|-------|----------|---------|
| `[BE]` | Backend/API only | `[BE] - Add email service for password reset` |
| `[WEB]` | Web frontend only | `[WEB] - Create login form` |
| `[MOBILE]` | Mobile app only | `[MOBILE] - Setup navigation stack` |
| `[BE, WEB]` | Changes in 2 apps | `[BE, WEB] - Update user response types` |
| `[BE, WEB, MOBILE]` | Changes in all 3 apps | `[BE, WEB, MOBILE] - Update shared types` |
| `[DOCS]` | Documentation only | `[DOCS] - Add API authentication guide` |
| `[CONFIG]` | Build, CI/CD, repo config | `[CONFIG] - Setup GitHub Actions` |
| `[TYPES]` | Shared types package only | `[TYPES] - Add UserGameResponse interface` |

### Description Guidelines

**Good:**
- ✅ `[BE] - Add password reset endpoint with token validation`
- ✅ `[WEB] - Create game list page with filtering`
- ✅ `[BE, WEB] - Add email service and integrate with auth`

**Avoid:**
- ❌ `Add stuff` (too vague)
- ❌ `Fix bug` (which bug?)
- ❌ `[ALL] - Updates` (unclear scope)
- ❌ `fixes` (not capitalized)
- ❌ Multiple unrelated changes without proper scope

---

## Commit Message Format

### Format

```
[SCOPE] - Brief description (50 chars max)

Optional detailed explanation of:
- Why this change was needed
- What problem it solves
- Important implementation details

Fixes #123 (if related to issue)
```

### Example Commits

```
[BE] - Add email service for password reset

- Create EmailService in auth module
- Integrate with forgot-password endpoint
- Add SMTP configuration support
- Include rate limiting (3 per 15 min)

Fixes #42
```

```
[WEB] - Create game collection page

- Add GameList component with pagination
- Implement status filter (todo/playing/completed)
- Add loading and error states
- Mobile responsive design
```

---

## Pull Request Template

When creating a PR, GitHub will auto-populate with this template:

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Configuration change
- [ ] Security improvement

## Scope
- [ ] Backend (API)
- [ ] Frontend (Web)
- [ ] Mobile
- [ ] Shared Types
- [ ] Documentation
- [ ] Configuration

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Tested manually

## Screenshots (if UI changes)
(Add screenshots if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] PR title follows naming convention: [SCOPE] - Description
- [ ] Related documentation is updated
- [ ] No breaking changes (or clearly documented)
- [ ] Tests pass locally
```

---

## Branch Naming Convention

Use descriptive branch names matching the scope:

```
[scope]/feature-name
[scope]/fix-issue-name
[scope]/docs-update
```

### Examples

```
[be]/password-reset
[web]/game-list-page
[mobile]/search-screen
[types]/user-response-types
[docs]/api-authentication
[config]/github-actions
```

---

## Workflow

### Before Starting Work

1. **Create an issue** (optional but recommended)
   - Describe the feature or bug
   - Add labels: `[BE]`, `[WEB]`, `[MOBILE]`, etc.

2. **Create a branch** from `main`
   ```bash
   git checkout -b [scope]/feature-name
   ```

### While Developing

1. **Write clean commits** with descriptive messages
   ```bash
   git commit -m "[BE] - Add email service"
   ```

2. **Keep commits organized**
   - One feature = one logical commit (or squash if needed)
   - Don't mix unrelated changes

3. **Push to remote**
   ```bash
   git push -u origin [scope]/feature-name
   ```

### Creating a Pull Request

1. **Title follows convention**
   ```
   [BE] - Add password reset functionality
   ```

2. **Description is clear**
   - What changed and why
   - Any breaking changes
   - Related issues

3. **Fill in PR template**
   - Select scope
   - Check testing boxes
   - Add screenshots if needed

4. **Code review**
   - Wait for approvals
   - Address feedback
   - Resolve conflicts if any

5. **Merge**
   - Use "Squash and merge" to keep history clean
   - Title should follow naming convention
   - Delete branch after merge

---

## Commit Message Standards

### What Gets a Commit?

**Good commit unit:**
- Single feature/fix
- Tests updated
- Related changes grouped
- Can be reverted independently

**Examples of good commits:**
- Add new endpoint with tests
- Fix validation bug in DTO
- Update documentation section
- Refactor service method with tests

**Examples of bad commits:**
- "WIP" or "test"
- Multiple unrelated features
- Without corresponding tests

### Amending Commits

Before pushing, you can amend:
```bash
git commit --amend
```

After pushing, **don't amend** - create a new commit instead:
```bash
git commit -m "[BE] - Fix validation in previous commit"
```

---

## Code Review Checklist

When reviewing PRs, check:

- ✅ Title follows `[SCOPE] - Description` format
- ✅ Scope is accurate (correct apps tagged)
- ✅ Description is clear
- ✅ Changes are related (no mixing unrelated stuff)
- ✅ Tests are updated
- ✅ No breaking changes (or documented)
- ✅ Code follows project style
- ✅ Security best practices followed

---

## GitHub Settings (Setup Required)

### Branch Protection Rules

**Enforces:**
- PR reviews required
- All checks must pass
- Branches stay up-to-date before merge

**Setup:**
1. Go to **Settings → Branches → Add rule**
2. Apply to `main`
3. Enable: "Require pull request reviews"
4. Enable: "Require status checks to pass"

### Pull Request Template

The repo includes a PR template at `.github/pull_request_template.md`

**Automatically shown** when creating a PR on GitHub

---

## GitHub Actions Automation

### PR Title Validator (Optional)

You can add a GitHub Action to validate PR titles:

**File:** `.github/workflows/validate-pr-title.yml`

```yaml
name: Validate PR Title

on: pull_request

jobs:
  validate-title:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR title format
        run: |
          TITLE="${{ github.event.pull_request.title }}"
          if [[ ! $TITLE =~ ^\[[A-Z]+(\,\ [A-Z]+)*\]\ -\ .+ ]]; then
            echo "❌ PR title must follow format: [SCOPE] - Description"
            echo "   Example: [BE] - Add password reset"
            echo "   Example: [BE, WEB] - Update types"
            exit 1
          fi
          echo "✅ PR title valid: $TITLE"
```

### Commit Lint (Optional)

Validate commit messages locally:

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

Create `commitlint.config.js`:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'type-enum': [2, 'always', ['[BE]', '[WEB]', '[MOBILE]', '[DOCS]', '[CONFIG]', '[TYPES]']],
  },
};
```

---

## Examples from Git History

**Good Examples (Already in repo):**
```
✅ [BE, WEB, MOBILE] - READMEs, examples, AGENTS file
✅ [BE, WEB, MOBILE] - Repo setup
```

**Examples to Follow:**
```
✅ [BE] - Add password reset functionality
✅ [WEB] - Create game collection UI
✅ [MOBILE] - Setup navigation
✅ [BE, WEB] - Update shared types
✅ [DOCS] - Update README with deployment guide
```

**Examples to Avoid:**
```
❌ roadmap files and root readme update (no scope)
❌ update docs and agent files (no scope, vague)
❌ export types to packages (unclear what changed where)
```

---

## Questions?

- Check [ROADMAP.md](./ROADMAP.md) for project stages
- See [apps/api/CLAUDE.md](./apps/api/CLAUDE.md) for backend guidelines
- Review existing PRs for examples

