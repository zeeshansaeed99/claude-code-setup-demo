---
name: add-endpoint
description: Add a new route to the notes API with tests, following this project's conventions. Use when asked to add, create or expose an endpoint or route.
---

# Add an endpoint

1. **Confirm the contract** in one line before coding: method, path, request body, success status and body, error cases.
2. **Store first:** if the route needs new data access, add a small exported function to `src/store.ts`.
3. **Route:** add an `if` block in `handle()` in `src/app.ts`, above the final 404. Use `send()`; return `{ error }` with 400 for bad input and 404 for unknown ids.
4. **Tests:** add to `test/notes.test.ts` (or a new `test/<area>.test.ts`): one success test plus every error case from step 1. Use `fetch` against `base`.
5. **Run `npm test`** and fix until it passes.
6. **Report:** the new route, the tests added, and the `npm test` summary line.

Rules: imports end in `.ts`; no enums or frameworks; don't touch `src/server.ts` unless the change needs it.
