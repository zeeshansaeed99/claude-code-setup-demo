export type Note = { id: number; title: string; body: string; createdAt: string };

const notes = new Map<number, Note>();
let nextId = 1;

export function listNotes(): Note[] {
  return [...notes.values()];
}

export function getNote(id: number): Note | undefined {
  return notes.get(id);
}

export function createNote(title: string, body: string): Note {
  const note: Note = { id: nextId++, title, body, createdAt: new Date().toISOString() };
  notes.set(note.id, note);
  return note;
}

export function deleteNote(id: number): boolean {
  return notes.delete(id);
}

export function resetStore(): void {
  notes.clear();
  nextId = 1;
}
