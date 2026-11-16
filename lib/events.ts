import raw from '@/data/holidays.json';
import { festivals } from '@/data/festivals';
import { countryByCode } from '@/data/countries';
import type { TravelEvent } from './types';

// Sri Lanka's upstream calendar is table-based and has no 2027–28 table yet.
// Only recurring fixed-date holidays are supplied here, all marked projected.
const sriLanka: TravelEvent[] = [2027, 2028].flatMap(year => [
  ['02-04', 'Independence Day'], ['04-13', 'Day prior to Sinhala and Tamil New Year'],
  ['04-14', 'Sinhala and Tamil New Year'], ['05-01', 'May Day'], ['12-25', 'Christmas Day'],
].map(([date, title]) => ({ id: `LK-${year}-${date}-fixed`, country: 'LK', title, start: `${year}-${date}`, end: `${year}-${date}`, type: 'holiday', major: /New Year|Independence|Christmas/.test(title), status: 'projected', location: 'Sri Lanka · national calendar', description: 'A recurring holiday used as a planning placeholder. The 2027–2028 government calendar has not been verified here.', impact: 'This calendar is partial. Poya and other lunar holidays are not yet included; check the official annual calendar.', source: 'https://www.cbsl.gov.lk/en/about/bank-holidays', sourceLabel: 'Central Bank of Sri Lanka', checked: '2026-11-16' })));

type RawDay = [string, string, number, string, boolean];
const calculated: TravelEvent[] = (raw.days as RawDay[]).map(([country, date, index, title, major]) => ({
  id: `${country}-${date}-${index}`, country, title, start: date, end: date, type:'holiday', major, status:'projected',
  location: `${countryByCode[country].name} · national calendar`,
  description: `${title} is listed in the national public-holiday rules for ${countryByCode[country].name}. This is a calculated planning date, not a verified government announcement for ${date.slice(0,4)}.`,
  impact:'Check local opening hours and transport schedules. Regional observance, substitute days and additional government holidays can differ.',
  source:`https://holidays.readthedocs.io/en/latest/auto_gen_docs/${(raw.modules as Record<string,string>)[country]}/`,
  sourceLabel:`python-holidays ${raw.version}`, checked:raw.generated,
}));

const generated = calculated.filter(event => !festivals.some(f => f.country === event.country && f.type !== 'season' && event.start >= f.start && event.start <= f.end && (
  (f.id.includes('songkran') && /songkran/i.test(event.title)) ||
  (f.id.includes('naadam') && /naadam/i.test(event.title))
)));

export const events: TravelEvent[] = [...generated, ...sriLanka, ...festivals].sort((a,b) => a.start.localeCompare(b.start) || Number(b.major) - Number(a.major) || a.title.localeCompare(b.title));
export const eventById = Object.fromEntries(events.map(e => [e.id, e])) as Record<string, TravelEvent>;
export const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function overlaps(event: TravelEvent, start: string, end: string) { return event.start <= end && event.end >= start; }
export function monthRange(year: number, month: number) {
  return { start: `${year}-${String(month+1).padStart(2,'0')}-01`, end: `${year}-${String(month+1).padStart(2,'0')}-${new Date(Date.UTC(year,month+1,0)).getUTCDate()}` };
}
export function dateLabel(event: TravelEvent, showYear = false) {
  const format = (d: string) => new Date(d+'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(showYear ? {year:'numeric' as const} : {}), timeZone:'UTC' });
  return event.start === event.end ? format(event.start) : `${format(event.start)} – ${format(event.end)}`;
}
export const statusLabel: Record<TravelEvent['status'], string> = { annual:'Annual tradition', projected:'Projected date', confirmed:'Confirmed date', seasonal:'Seasonal window' };
export function eventCountryName(event: TravelEvent) { return countryByCode[event.country]?.name || event.country; }
