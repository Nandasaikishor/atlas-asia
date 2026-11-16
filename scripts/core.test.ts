import test from 'node:test';
import assert from 'node:assert/strict';
import { countries } from '../data/countries';
import { events, monthRange, overlaps } from '../lib/events';
import { toICalendar } from '../lib/ical';
import { emptyNotebook, mergeNotebooks, parseNotebook } from '../lib/notebook';

const codes = new Set(countries.map(c=>c.code));
const ids = new Set(events.map(e=>e.id));

test('directory, event IDs, date ranges and country references are consistent', () => {
  assert.equal(countries.length,52);
  assert.equal(codes.size,countries.length);
  assert.equal(ids.size,events.length);
  for (const event of events) {
    assert.ok(codes.has(event.country),event.id);
    for (const date of [event.start,event.end]) {
      assert.match(date,/^202[78]-\d{2}-\d{2}$/);
      assert.equal(new Date(date+'T00:00:00Z').toISOString().slice(0,10),date);
    }
    assert.ok(event.end>=event.start,event.id);
    assert.ok(event.source.startsWith('https://'),event.id);
    assert.notEqual(event.status,'confirmed','No source has confirmed a 2027–28 annual programme yet.');
  }
  for (const c of countries) {
    for (const year of [2027,2028]) assert.ok(events.some(e=>e.country===c.code&&e.start.startsWith(String(year))), `${c.name} ${year} has no data`);
    assert.ok(c.visa.url.startsWith('https://'));
    assert.ok(c.food.length>30&&c.transport.length>30&&c.solo.length>30,c.name);
  }
});

test('leap February and cross-month occasions are included correctly', () => {
  assert.deepEqual(monthRange(2028,1),{start:'2028-02-01',end:'2028-02-29'});
  assert.equal(monthRange(2027,1).end,'2027-02-28');
  const sakura=events.find(e=>e.id==='JP-sakura-2027')!;
  assert.ok(overlaps(sakura,'2027-04-01','2027-04-30'));
  assert.ok(!overlaps(sakura,'2027-06-01','2027-06-30'));
});

test('calendar export uses inclusive event dates, exclusive ICS end and tentative status', () => {
  const original=events.find(e=>e.id==='TH-songkran-2027')!;
  const fixture={...original,title:'A, B; C\\D',start:'2028-02-29',end:'2028-02-29',description:'漢字 🌸 '.repeat(50)};
  const ics=toICalendar([fixture],new Date('2026-11-16T00:00:00Z'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20280229\r\n'));
  assert.ok(ics.includes('DTEND;VALUE=DATE:20280301\r\n'));
  assert.ok(ics.includes('SUMMARY:A\\, B\\; C\\\\D'));
  assert.ok(ics.includes('STATUS:TENTATIVE'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(ics.split('\r\n').every(line=>new TextEncoder().encode(line).length<=75));
  const songkran=toICalendar([original]);
  assert.ok(songkran.includes('DTEND;VALUE=DATE:20270416'));
});

test('backup import validates version, IDs and notes without overwriting existing notes', () => {
  const base=emptyNotebook();
  base.countries=['JP'];base.notes.JP='Kyoto';
  const incoming={version:1,countries:['JP','TH','TH'],events:[events[0].id],visited:['TH'],notes:{JP:'Tokyo'}};
  const parsed=parseNotebook(incoming,codes,ids);
  assert.deepEqual(parsed.countries,['JP','TH']);
  const merged=mergeNotebooks(base,parsed);
  assert.deepEqual(merged.countries,['JP','TH']);
  assert.ok(merged.notes.JP.includes('Kyoto')&&merged.notes.JP.includes('Tokyo'));
  assert.throws(()=>parseNotebook({...incoming,version:2},codes,ids));
  assert.throws(()=>parseNotebook({...incoming,countries:['not-a-country']},codes,ids));
  assert.throws(()=>parseNotebook({...incoming,events:['javascript:bad']},codes,ids));
  assert.throws(()=>parseNotebook({...incoming,notes:{JP:'x'.repeat(20001)}},codes,ids));
  assert.throws(()=>parseNotebook(null,codes,ids));
});
