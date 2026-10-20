import type { IncomingMessage, ServerResponse } from 'node:http';
import { createNote, deleteNote, getNote, listNotes } from './store.ts';

function send(res: ServerResponse, status: number, data?: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(data === undefined ? '' : JSON.stringify(data));
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const match = url.pathname.match(/^\/notes\/(\d+)$/);

  if (url.pathname === '/health' && req.method === 'GET') return send(res, 200, { ok: true });

  if (url.pathname === '/notes' && req.method === 'GET') return send(res, 200, listNotes());

  if (url.pathname === '/notes' && req.method === 'POST') {
    const body = await readJson(req);
    if (!body || typeof body.title !== 'string' || body.title.trim() === '') {
      return send(res, 400, { error: 'title is required' });
    }
    return send(res, 201, createNote(body.title.trim(), typeof body.body === 'string' ? body.body : ''));
  }

  if (match && req.method === 'GET') {
    const note = getNote(Number(match[1]));
    return note ? send(res, 200, note) : send(res, 404, { error: 'not found' });
  }

  if (match && req.method === 'DELETE') {
    return deleteNote(Number(match[1])) ? send(res, 204) : send(res, 404, { error: 'not found' });
  }

  send(res, 404, { error: 'not found' });
}
