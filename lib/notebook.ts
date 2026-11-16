import type { Notebook } from './types';

export const STORAGE_KEY = 'atlas-asia-notebook-v1';
export const emptyNotebook = (): Notebook => ({ version:1, countries:[], events:[], visited:[], notes:{} });

export function parseNotebook(input: unknown, countryCodes: Set<string>, eventIds: Set<string>): Notebook {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('This is not an Atlas Asia backup.');
  const value = input as Record<string, unknown>;
  if (value.version !== 1) throw new Error('This backup version is not supported.');
  const list = (key: string, allowed: Set<string>) => {
    const arr = value[key];
    if (!Array.isArray(arr) || arr.length > 10000 || arr.some(x => typeof x !== 'string' || !allowed.has(x))) throw new Error(`Invalid ${key} in backup.`);
    return [...new Set(arr)] as string[];
  };
  const countries = list('countries', countryCodes), events = list('events', eventIds), visited = list('visited', countryCodes);
  if (!value.notes || typeof value.notes !== 'object' || Array.isArray(value.notes)) throw new Error('Invalid notes in backup.');
  const notes: Record<string,string> = {};
  for (const [key, note] of Object.entries(value.notes)) {
    if (!countryCodes.has(key) || typeof note !== 'string' || note.length > 20000) throw new Error('Invalid country note in backup.');
    notes[key] = note;
  }
  return {version:1, countries, events, visited, notes};
}

export function mergeNotebooks(current: Notebook, incoming: Notebook): Notebook {
  const notes = {...current.notes};
  for (const [code, note] of Object.entries(incoming.notes)) {
    notes[code] = notes[code] && notes[code] !== note ? `${notes[code]}\n\nImported note:\n${note}`.slice(0,20000) : note;
  }
  return { version:1, countries:[...new Set([...current.countries,...incoming.countries])], events:[...new Set([...current.events,...incoming.events])], visited:[...new Set([...current.visited,...incoming.visited])], notes };
}
