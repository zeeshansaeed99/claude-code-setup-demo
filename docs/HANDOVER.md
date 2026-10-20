# Claude Code setup: handover guide

## What was added
| File | What it does |
|---|---|
| `CLAUDE.md` | Project facts Claude reads at the start of every session: commands, layout, conventions, guardrails. |
| `.claude/settings.json` | Team-shared settings: routine commands allowed without prompts, `.env` reads and force-pushes denied, two hooks. |
| `.claude/hooks/block-env-edits.mjs` | Stops any edit to a real `.env` file. |
| `.claude/hooks/tests-before-stop.mjs` | If `src/` or `test/` changed, runs `npm test` before Claude can finish; failures go back to Claude. |
| `.claude/skills/add-endpoint` | `/add-endpoint`: adds a route the project's way, tests included. |
| `.claude/skills/release-notes` | `/release-notes`: user-facing notes for the current branch. |

## Verify it yourself (5 minutes)
1. `git checkout after && npm test`: 5 tests pass.
2. Open Claude Code in the repo and run `/add-endpoint` with: *PATCH /notes/:id updates the title; 400 if the title is empty, 404 if the note doesn't exist.*
3. Expected: it edits `src/app.ts` and `src/store.ts`, adds tests, runs `npm test` without asking, and finishes with all tests passing.
4. Ask it to "put PORT=4000 in .env". Expected: the hook blocks it and Claude proposes `.env.example`.

## Changing it later
- New command or convention: add one line to `CLAUDE.md`, and verify the command actually runs first.
- Prompted again for a safe command: add it to `permissions.allow` in `.claude/settings.json`.
- Personal preferences go in `.claude/settings.local.json` (git-ignored by Claude Code), not the shared file.

## Troubleshooting
- **Hooks don't fire:** run `/hooks` in Claude Code to confirm they're loaded; restart the session after editing settings.
- **Stop hook loops:** it lets Claude stop on the second attempt (`stop_hook_active`); if tests still fail, the report says so.
- **`node --test` can't find tests:** Node must be 23.6+ (`node -v`).
