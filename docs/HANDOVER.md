# Claude Code setup: handover guide

## What was added
| File | What it does |
|---|---|
| `CLAUDE.md` | Project facts Claude reads at the start of every session: commands, layout, conventions, guardrails. |
| `.claude/settings.json` | Team-shared settings: routine test/start/git commands allowed without prompts; Read-tool access to `.env` files and `git push --force` / `-f` (in that order) denied; two hooks. |
| `.claude/hooks/block-env-edits.mjs` | Blocks Claude's edit tools on real `.env` files and shell commands that name one. Does not catch commands that reach the file without naming it. |
| `.claude/hooks/tests-before-stop.mjs` | Runs `npm test` on every attempt to finish. A first failure sends Claude back; a failure after the retry lets it stop with an explicit UNRESOLVED message. |
| `.claude/skills/add-endpoint` | `/add-endpoint`: adds a route the project's way, tests included. |
| `.claude/skills/release-notes` | `/release-notes`: user-facing notes for the current branch. |

## Verify it yourself (5 minutes)
1. `git checkout after && npm test`: 5 tests pass.
2. Open Claude Code in the repo and run `/add-endpoint` with: *PATCH /notes/:id updates the title; 400 if the title is empty, 404 if the note doesn't exist.*
3. Expected: it edits `src/app.ts` and `src/store.ts`, adds tests, runs `npm test` without asking, and finishes with a "Tests passed" message. If you instead see "UNRESOLVED", the task is not done.
4. Ask it to "put PORT=4000 in .env". Expected: the hook blocks it and Claude proposes `.env.example`.

## Changing it later
- New command or convention: add one line to `CLAUDE.md`, and verify the command actually runs first.
- Prompted again for a safe command: add it to `permissions.allow` in `.claude/settings.json`.
- Personal preferences go in `.claude/settings.local.json` (git-ignored by Claude Code), not the shared file.

## Troubleshooting
- **Hooks don't fire:** run `/hooks` in Claude Code to confirm they're loaded; restart the session after editing settings.
- **Stop hook loops:** it can't loop forever. On the retry (`stop_hook_active`) it lets Claude stop, and if the tests still fail you see an UNRESOLVED message.
- **Force-push protection:** the deny rules only match `git push --force…` and `git push -f…`. Use GitHub branch protection for real protection.
- **`node --test` can't find tests:** Node must be 23.6+ (`node -v`).
