# notes-api: Claude Code setup demo

A deliberately small Node + TypeScript notes API, used to show what a Claude Code project setup adds.

| Branch | What it is |
|---|---|
| `before` | Code and tests only, with no Claude Code configuration. |
| `after` (this branch) | The same code plus a Claude Code setup: `CLAUDE.md`, scoped permissions, two hooks, two skills and a handover guide. |

## Run it

Requires Node 23.6 or newer (TypeScript runs natively: no build step, no dependencies).

```sh
npm test     # 5 tests
npm start    # http://localhost:3000
```

## What the setup is for

These are **potential** problems a setup addresses. They have not yet been observed on the `before` branch in a recorded run; Claude may well find the commands in `package.json` on its own. See *Comparison run* below.

| Potential problem | What `after` adds |
|---|---|
| Guessing commands or adding tools the project doesn't use (Jest, `tsc`, a build step) | `CLAUDE.md` lists the verified commands and says there is no build or lint step. |
| Missing this project's conventions (`.ts` import paths, no frameworks, tests per route) | `CLAUDE.md` conventions and the `/add-endpoint` skill. |
| Routine commands prompting every time | A permission allowlist for test, start and common git commands. |
| Finishing with failing tests | A Stop hook runs the tests on every attempt to finish; see the exact behaviour below. |
| Accidental edits to `.env` | A hook blocks `.env` edits through Claude's edit tools and shell commands that name the file. |

## Exactly what the hooks do (tested)

**Tests on finish** (`.claude/hooks/tests-before-stop.mjs`): runs `npm test` every time Claude tries to stop, whether or not files changed and whether or not they were committed.
- Pass: Claude stops and you see "Tests passed (…)".
- Fail on the first attempt: Claude is sent back with the failures.
- Still failing after that retry: Claude is allowed to stop (to avoid an endless loop), and you see **"UNRESOLVED: tests still fail … NOT verified as complete."**

So it guarantees you are *told* the result. It cannot force the tests to pass.

**`.env` guard** (`.claude/hooks/block-env-edits.mjs`):
- Blocks: Claude's Edit/Write/MultiEdit tools on `.env`, `.env.local`, `.env.production` etc.; shell commands that name such a file (`echo X >> .env`, `cat ./.env`, `sed -i … .env.production`, `cp .env.example .env`).
- Allows: `.env.example`, and every other file.
- **Does not catch:** shell commands that reach the file without naming it (a variable, a glob, a script). It prevents accidents; it is not a security boundary.

**Permission deny rules** (`.claude/settings.json`): deny reading `.env` / `.env.*` with the Read tool, and deny `git push --force…` / `git push -f…` written in that order. Other forms (`git push origin main -f`, `--force-with-lease`, `+branch` refspecs) are **not** covered. To truly prevent force-pushes, turn on branch protection on GitHub.

## Comparison run

*Pending.* The same task (`PATCH /notes/:id`, with a 400 for an empty title and a 404 for an unknown id) will be run in Claude Code on both branches, recording the Claude Code version, the loaded settings, what happened, and the test result, including if the unconfigured run does just as well.

Full details: [`docs/HANDOVER.md`](docs/HANDOVER.md).
