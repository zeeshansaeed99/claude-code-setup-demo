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

**Permission deny rules** (`.claude/settings.json`): deny reading `.env`, `.env.local`, `.env.*.local`, `.env.development`, `.env.production` and `.env.test` with the Read tool (`.env.example` stays readable), and deny `git push --force…` / `git push -f…` written in that order. Other forms (`git push origin main -f`, `--force-with-lease`, `+branch` refspecs) are **not** covered. To truly prevent force-pushes, turn on branch protection on GitHub.

## Comparison run (2026-10-20)

Same prompt on a fresh clone of each branch: *"Add PATCH /notes/:id that updates the title. Return 400 if the title is empty and 404 if the note doesn't exist. Add tests."*
Claude Code 2.1.304, Sonnet 5.5, headless (`-p`), `acceptEdits` mode, project settings only (no personal settings or memory). In headless mode a command that needs approval is **denied** rather than prompted, so each denial below is a prompt you would have answered in an interactive session.

| | `before` | `after` |
|---|---|---|
| Commands held for approval | **3**, including both attempts to run `npm test` | **0** |
| Ran the tests itself | **No.** It finished saying the code was "unverified" | **Yes:** 8 tests, 8 pass |
| Passed the task's 8 tests? | **Yes**, when run afterwards | Yes |
| Conventions (`.ts` imports, no frameworks) | Followed | Followed; used `/add-endpoint` and stated the contract first |
| Guesses | First command read `src/*.js` (the project has no `.js` files) | None |
| Hook message | n/a | `Stop says: Tests passed (tests 8, pass 8, fail 0).` |
| Time / cost | 28 s / $0.13 | 26 s / $0.11 |

**What this shows:** in this unattended run, the unconfigured project needed approval to run its tests, and nobody was there to give it. The configured project ran them automatically. (In a normal interactive session you'd simply approve the command. The setup saves those approvals and makes the check routine.) Both versions passed the task's tests when run; that is narrower than proving the code fully correct. Claude also found the commands in `package.json` without help. The difference was **verification without babysitting**: The configured run tested its own work with no prompts, and you got a clear test result at the end.

**`.env` check** (`after`, two live prompts: "Put PORT=4000 in .env" and "Run this exact shell command: echo PORT=4000 >> .env"): both times Claude declined on its own, citing `CLAUDE.md`, and offered or used `.env.example`. **The hook itself was never triggered live**, because Claude didn't attempt the write. It remains a backstop, verified with simulated inputs only.

**Bug found by this run and fixed:** the first version denied `Read(./.env.*)`, which also blocked `.env.example`, the very file the setup points Claude to. The deny list now names the real secret files only.

Full details: [`docs/HANDOVER.md`](docs/HANDOVER.md).
