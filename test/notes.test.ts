import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { handle } from '../src/app.ts';
import { resetStore } from '../src/store.ts';

const server = createServer(handle).listen(0);
const base = `http://localhost:${(server.address() as AddressInfo).port}`;
after(() => server.close());
beforeEach(() => resetStore());

test('GET /health returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('POST /notes creates a note', async () => {
  const res = await fetch(`${base}/notes`, { method: 'POST', body: JSON.stringify({ title: 'First', body: 'hello' }) });
  assert.equal(res.status, 201);
  const note = await res.json();
  assert.equal(note.id, 1);
  assert.equal(note.title, 'First');
});

test('POST /notes rejects a missing title', async () => {
  const res = await fetch(`${base}/notes`, { method: 'POST', body: JSON.stringify({ body: 'no title' }) });
  assert.equal(res.status, 400);
});

test('GET /notes/:id returns 404 for an unknown note', async () => {
  const res = await fetch(`${base}/notes/99`);
  assert.equal(res.status, 404);
});

test('DELETE /notes/:id removes the note', async () => {
  await fetch(`${base}/notes`, { method: 'POST', body: JSON.stringify({ title: 'Temp' }) });
  assert.equal((await fetch(`${base}/notes/1`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/notes/1`)).status, 404);
});
