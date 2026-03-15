#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve, relative } from "path";

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
            const output = execSync(
                `git log ${ref}..HEAD --pretty=format:%B%n---END_COMMIT---`,
                {
                    encoding: "utf-8",
                },
            );
            return output.split("---END_COMMIT---").filter((c) => c.trim());
        } else {
            // Get commits since last tag, or all if no tags
            let lastTag;
            try {
                lastTag = execSync("git describe --tags --abbrev=0", {
                    encoding: "utf-8",
                }).trim();
            } catch {
                // No tags found, get all commits
                lastTag = null;
            }

            if (lastTag) {
                const output = execSync(
                    `git log ${lastTag}..HEAD --pretty=format:%B%n---END_COMMIT---`,
                    {
                        encoding: "utf-8",
                    },
                );
                return output.split("---END_COMMIT---").filter((c) => c.trim());
            } else {
                // No tags, get last 50 commits as fallback
                const output = execSync(
                    "git log -50 --pretty=format:%B%n---END_COMMIT---",
                    {
                        encoding: "utf-8",
                    },
                );
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

/** Normalize a bullet line for dedupe: trim and strip trailing " (#n)". */
function normalizeEntry(text) {
    return text
        .trim()
        .replace(/\s*\(#\d+\)\s*$/, "")
        .trim();
}

/** Extract existing bullet texts from [Unreleased] section (normalized). */
function getExistingUnreleasedEntries(content) {
    const idx = content.indexOf("## [Unreleased]");
    if (idx === -1) return new Set();
    const after = content.slice(idx);
    const nextH2 = after.indexOf("\n## ", 1);
    const sectionEnd = nextH2 === -1 ? after.length : nextH2;
    const section = after.slice(after.indexOf("\n") + 1, sectionEnd);
    const set = new Set();
    for (const line of section.split("\n")) {
        const m = line.match(/^\s*-\s+(.+)$/);
        if (m) set.add(normalizeEntry(m[1]));
    }
    return set;
}

/**
 * Update changelog with new entries. Skips entries already present under [Unreleased].
 */
function updateChangelog(appPath, entries) {
    const content = readChangelog(appPath);
    if (!content) {
        console.error(`  ❌ CHANGELOG not found at ${appPath}`);
        return false;
    }

    const unreleasePattern = /^## \[Unreleased\]$/m;
    if (!unreleasePattern.test(content)) {
        console.error(`  ❌ [Unreleased] section not found in ${appPath}`);
        return false;
    }

    const existing = getExistingUnreleasedEntries(content);
    const added = entries.Added.filter((e) => !existing.has(normalizeEntry(e)));
    const fixed = entries.Fixed.filter((e) => !existing.has(normalizeEntry(e)));
    const changed = entries.Changed.filter(
        (e) => !existing.has(normalizeEntry(e)),
    );

    if (added.length === 0 && fixed.length === 0 && changed.length === 0) {
        console.log(
            `⏭️  Skipped ${relative(process.cwd(), appPath)} (all entries already in [Unreleased])`,
        );
        return false;
    }

    let newEntries = "";
    if (added.length > 0) {
        newEntries += "\n### Added\n";
        added.forEach((entry) => {
            newEntries += `- ${entry}\n`;
        });
    }
    if (fixed.length > 0) {
        newEntries += "\n### Fixed\n";
        fixed.forEach((entry) => {
            newEntries += `- ${entry}\n`;
        });
    }
    if (changed.length > 0) {
        newEntries += "\n### Changed\n";
        changed.forEach((entry) => {
            newEntries += `- ${entry}\n`;
        });
    }

    const updatedContent = content.replace(
        unreleasePattern,
        `## [Unreleased]\n${newEntries}`,
    );

    writeFileSync(appPath, updatedContent);
    return true;
}

/**
 * Check if app has any changes
 */
function hasChanges(changes) {
    return (
        changes.Added.length > 0 ||
        changes.Fixed.length > 0 ||
        changes.Changed.length > 0
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
        const totalEntries =
            changes.Added.length +
            changes.Fixed.length +
            changes.Changed.length;

        if (updateChangelog(changelogPath, changes)) {
            console.log(
                `✅ Updated ${app}/CHANGELOG.md (${totalEntries} entries)`,
            );
            updateCount++;
        }
    });

    const totalCommits = commits.length;
    console.log(
        `\nTotal: ${totalCommits} commits processed, ${updateCount} apps updated, ${skipCount} apps skipped\n`,
    );
}

main();
