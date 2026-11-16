import type { TravelEvent } from './types';

function escapeText(text: string) { return text.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
function foldLine(line: string) {
  const lines: string[] = [];
  let current = '', bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) { lines.push(current); current = ' '; bytes = 1; }
    current += char; bytes += size;
  }
  lines.push(current);
  return lines.join('\r\n');
}
export function toICalendar(events: TravelEvent[], now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Atlas Asia//Travel Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Atlas Asia'];
  for (const e of events) {
    const end = new Date(e.end+'T00:00:00Z'); end.setUTCDate(end.getUTCDate()+1);
    const status = e.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE';
    lines.push('BEGIN:VEVENT', `UID:${e.id}@atlas-asia.local`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${e.start.replaceAll('-','')}`, `DTEND;VALUE=DATE:${end.toISOString().slice(0,10).replaceAll('-','')}`, `SUMMARY:${escapeText(e.title)}`, `LOCATION:${escapeText(e.location)}`, `DESCRIPTION:${escapeText(`${e.description}\n\n${e.impact}\n\nDate status: ${e.status}. Verify before booking.\nSource: ${e.source}`)}`, `STATUS:${status}`, `URL:${e.source}`, 'END:VEVENT');
  }
  return [...lines, 'END:VCALENDAR'].map(foldLine).join('\r\n')+'\r\n';
}
