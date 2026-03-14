# PR Validation - Quick Start

TL;DR version of the setup guide.

---

## ✅ Works Automatically (No Setup)

Just push the files to GitHub:

```bash
git add .github/ CONTRIBUTING.md
git commit -m "[CONFIG] - Add PR validation"
git push origin main
```

**That's it!** The workflow automatically:
- ✅ Validates every PR title
- ✅ Posts helpful comments
- ✅ Shows examples if title is wrong
- ✅ No configuration needed

---

## 🧪 Test It

1. Create test PR with wrong title: `Update something`
   - ❌ Workflow fails
   - 💬 Comment appears: "PR title does not follow..."

2. Edit title to: `[BE] - Update something`
   - ✅ Workflow passes
   - ✅ Auto-comment: "PR title is valid"

---

## 🔧 Optional: GitHub Settings (Recommended)

To **enforce** proper titles (prevent merge without valid title):

### In GitHub Web UI:

1. Go to **Settings → Branches**
2. Click **Add rule**
3. Pattern: `main`
4. Enable:
   - ☑ Require pull request
   - ☑ Require approvals: 1
   - ☑ Require status checks to pass
5. Select: `Validate PR Title / validate-title`
6. Click **Create**

**Result:** Can't merge until title is valid + reviewed

---

## 📋 Valid PR Titles

```
[BE] - Add password reset
[WEB] - Create login form
[MOBILE] - Setup navigation
[BE, WEB] - Update types
[BE, WEB, MOBILE] - Update package
[TYPES] - Add response interface
[DOCS] - Update README
[CONFIG] - Add GitHub Actions
```

---

## ❓ FAQ

**Q: Does it work without setup?**
A: Yes! The workflow runs automatically once pushed.

**Q: Do I need to change GitHub settings?**
A: No, but branch protection is recommended.

**Q: What if I mess up the title?**
A: Just edit it - workflow re-runs, you're good.

**Q: How long does validation take?**
A: Usually 30 seconds - 1 minute

**Q: Will it block merging?**
A: Only if you set branch protection to require it (optional)

---

## 🎯 Minimal vs Full Setup

### Minimal (Just Works)
- Push `.github/workflows/validate-pr-title.yml`
- Validation runs automatically
- PRs get feedback on title

### Full (More Control)
- Push all files
- Set branch protection
- Set require approvals
- Set require valid title
- Can't merge until all pass

---

See `.github/SETUP_GUIDE.md` for detailed instructions.

