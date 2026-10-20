---
name: release-notes
description: Write plain-English release notes for the changes on the current branch since it left `before` or `main`. Use when asked for release notes, a changelog entry or a PR summary.
---

# Release notes

1. Find the base: `git merge-base HEAD main` (fall back to `before` if `main` doesn't exist).
2. Read `git log --oneline <base>..HEAD` and `git diff --stat <base>..HEAD`; open diffs only where the log is unclear.
3. Write for API users, not developers:
   - **Added** / **Changed** / **Fixed** sections, omitting empty ones.
   - One line per change, naming the endpoint (`POST /notes`) and what a caller notices.
   - A **Breaking** line first if any response shape or status code changed.
4. End with the `npm test` result line.
