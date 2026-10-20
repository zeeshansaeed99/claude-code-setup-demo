# notes-api: Claude Code setup demo

A deliberately small Node + TypeScript notes API, used to show what a Claude Code project setup changes.

| Branch | What it is |
|---|---|
| `before` | The project as most teams have it: code and tests, no Claude Code setup. |
| `after` | The same code with a verified Claude Code setup: `CLAUDE.md`, permissions, hooks and skills. |

## Run it

Requires Node 23.6 or newer (TypeScript runs natively, with no build step and no dependencies).

```sh
npm test     # 5 tests
npm start    # http://localhost:3000
```

## Potential friction on this branch

These are problems a setup is meant to prevent. They have **not yet been observed** here in a recorded run; Claude may find the commands in `package.json` on its own. Typical risks without a setup:

1. **It guesses the commands.** It doesn't know tests run with `node --test` on `.ts` files, so it may try `npx jest`, `tsc` or install a test framework the project doesn't use.
2. **It doesn't know the conventions.** It may add Express, a build step or `.js` import paths, none of which this project uses (Node strips types natively; imports must end in `.ts`).
3. **Nothing stops a risky edit or an unfinished job.** It asks permission for every routine command, can edit `.env`, and can say "done" without running the tests.

The `after` branch (the default) shows the setup and exactly what each part covers.
