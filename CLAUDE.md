# notes-api

Small JSON notes API. Node 23.6+ runs the TypeScript directly: no build step, no dependencies.

## Commands (all verified)
- `npm test`: runs every `test/**/*.test.ts` with the built-in `node --test`. Must pass before you say a task is done.
- `npm start`: serves on `http://localhost:3000` (`PORT` overrides).
- There is no lint, build or `tsc` step. Don't add one unless asked.

## Layout
- `src/store.ts`: in-memory data (`listNotes`, `getNote`, `createNote`, `deleteNote`, `resetStore`).
- `src/app.ts`: the single request handler `handle(req, res)`; routing is plain `if` blocks on method + path.
- `src/server.ts`: starts the HTTP server. Keep it tiny.
- `test/*.test.ts`: tests start the real handler on a random port and call it with `fetch`.

## Conventions
- **Imports end in `.ts`** (`import { handle } from './app.ts'`). Node's type stripping requires it.
- **Only erasable TypeScript:** no `enum`, `namespace` or constructor parameter properties. Use `type` and string unions.
- No frameworks (Express, Fastify, Jest, Vitest). Use `node:http`, `node:test` and `node:assert/strict`.
- Responses always go through `send(res, status, data)`; errors are `{ "error": "<message>" }`.
- Every new route gets tests for the success path and at least one failure path (400 or 404).
- Call `resetStore()` in `beforeEach`; tests must not depend on order.

## Guardrails
- Never read or edit `.env` files (a hook blocks it). Put new settings in `.env.example`.
- Work on a branch; don't push or force-push unless asked.
