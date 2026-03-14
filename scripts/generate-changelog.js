#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// Configuration
const SCOPE_TO_APP = {
  BE: "apps/api",
  WEB: "apps/web",
  MOBILE: "apps/mobile",
  TYPES: "packages/types",
};

const CATEGORY_MAP = {
  feat: "Added",
  add: "Added",
  new: "Added",
  fix: "Fixed",
  bugfix: "Fixed",
  perf: "Changed",
  refactor: "Changed",
  update: "Changed",
  remove: "Changed",
  delete: "Changed",
};

// Parse command line arguments
const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const sinceCommitIdx = args.indexOf("--since-commit");
const sinceTagIdx = args.indexOf("--since-tag");

let sinceRef = null;
if (sinceCommitIdx !== -1) {
  sinceRef = args[sinceCommitIdx + 1];
}
if (sinceTagIdx !== -1) {
  sinceRef = args[sinceTagIdx + 1];
}

/**
 * Get commits since a reference (tag/commit) or all commits if no reference
 */
function getCommitsSinceRef(ref) {
  try {
    if (ref) {
      // Get commits since specific reference
      const output = execSync(`git log ${ref}..HEAD --pretty=format:%B%n---END_COMMIT---`, {
        encoding: "utf-8",
      });
      return output.split("---END_COMMIT---").filter((c) => c.trim());
    } else {
      // Get commits since last tag, or all if no tags
      let lastTag;
      try {
        lastTag = execSync("git describe --tags --abbrev=0", { encoding: "utf-8" }).trim();
      } catch {
        // No tags found, get all commits
        lastTag = null;
      }

      if (lastTag) {
        const output = execSync(`git log ${lastTag}..HEAD --pretty=format:%B%n---END_COMMIT---`, {
          encoding: "utf-8",
        });
        return output.split("---END_COMMIT---").filter((c) => c.trim());
      } else {
        // No tags, get last 50 commits as fallback
        const output = execSync("git log -50 --pretty=format:%B%n---END_COMMIT---", {
          encoding: "utf-8",
        });
        return output.split("---END_COMMIT---").filter((c) => c.trim());
      }
    }
  } catch (error) {
    console.error("Error getting commits:", error.message);
    return [];
  }
}

/**
 * Parse a commit message and extract scope and description
 * Format: [SCOPE] - Description
 */
function parseCommit(message) {
  const lines = message.split("\n").filter((l) => l.trim());
  if (!lines.length) return null;

  const firstLine = lines[0];
  const scopeMatch = firstLine.match(/^\[([A-Z_,\s]+)\]\s*-\s*(.+)$/);

  if (!scopeMatch) {
    return null;
  }

  const scopes = scopeMatch[1].split(",").map((s) => s.trim());
  const description = scopeMatch[2].trim();

  return {
    scopes,
    description,
    fullMessage: firstLine,
  };
}

/**
 * Extract category from commit description
 */
function getCategoryFromDescription(description) {
  const lowerDesc = description.toLowerCase();

  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (lowerDesc.includes(key)) {
      return category;
    }
  }

  // Default category
  return "Changed";
}

/**
 * Parse all commits and map them to apps
 */
function parseAllCommits(commits) {
  const appChanges = {};

  // Initialize app changes
  Object.values(SCOPE_TO_APP).forEach((app) => {
    appChanges[app] = {
      Added: [],
      Fixed: [],
      Changed: [],
    };
  });

  // Parse each commit
  commits.forEach((commit) => {
    const parsed = parseCommit(commit);
    if (!parsed) return;

    const { scopes, description } = parsed;
    const category = getCategoryFromDescription(description);

    // Map each scope to its app
    scopes.forEach((scope) => {
      const app = SCOPE_TO_APP[scope];
      if (app && appChanges[app]) {
        appChanges[app][category].push(description);
      }
    });
  });

  return appChanges;
}

/**
 * Read current changelog
 */
function readChangelog(appPath) {
  try {
    return readFileSync(appPath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Update changelog with new entries
 */
function updateChangelog(appPath, entries) {
  const content = readChangelog(appPath);
  if (!content) {
    console.error(`  ❌ CHANGELOG not found at ${appPath}`);
    return false;
  }

  // Build new entries markdown
  let newEntries = "";
  if (entries.Added.length > 0) {
    newEntries += "\n### Added\n";
    entries.Added.forEach((entry) => {
      newEntries += `- ${entry}\n`;
    });
  }
  if (entries.Fixed.length > 0) {
    newEntries += "\n### Fixed\n";
    entries.Fixed.forEach((entry) => {
      newEntries += `- ${entry}\n`;
    });
  }
  if (entries.Changed.length > 0) {
    newEntries += "\n### Changed\n";
    entries.Changed.forEach((entry) => {
      newEntries += `- ${entry}\n`;
    });
  }

  // Find the [Unreleased] section and insert entries
  const unreleasePattern = /^## \[Unreleased\]$/m;
  if (!unreleasePattern.test(content)) {
    console.error(`  ❌ [Unreleased] section not found in ${appPath}`);
    return false;
  }

  const updatedContent = content.replace(
    unreleasePattern,
    `## [Unreleased]\n${newEntries}`
  );

  writeFileSync(appPath, updatedContent);
  return true;
}

/**
 * Check if app has any changes
 */
function hasChanges(changes) {
  return (
    changes.Added.length > 0 || changes.Fixed.length > 0 || changes.Changed.length > 0
  );
}

/**
 * Main execution
 */
function main() {
  // Get commits
  const commits = getCommitsSinceRef(sinceRef);

  if (!commits.length) {
    console.log("No commits found.");
    return;
  }

  // Parse commits
  const appChanges = parseAllCommits(commits);

  if (jsonOutput) {
    console.log(JSON.stringify(appChanges, null, 2));
    return;
  }

  // Update changelogs
  console.log("\n📝 Updating changelogs...\n");
  let updateCount = 0;
  let skipCount = 0;

  Object.entries(appChanges).forEach(([app, changes]) => {
    if (!hasChanges(changes)) {
      console.log(`⏭️  Skipped ${app}/CHANGELOG.md (no changes)`);
      skipCount++;
      return;
    }

    const changelogPath = resolve(process.cwd(), `${app}/CHANGELOG.md`);
    const totalEntries = changes.Added.length + changes.Fixed.length + changes.Changed.length;

    if (updateChangelog(changelogPath, changes)) {
      console.log(`✅ Updated ${app}/CHANGELOG.md (${totalEntries} entries)`);
      updateCount++;
    }
  });

  const totalCommits = commits.length;
  console.log(`\nTotal: ${totalCommits} commits processed, ${updateCount} apps updated, ${skipCount} apps skipped\n`);
}

main();
