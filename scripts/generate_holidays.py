"""Refresh the checked-in calendar: pip install -r scripts/requirements.txt && python scripts/generate_holidays.py.

All generated future dates are deliberately labelled projected. This dataset does
not assert that any government has gazetted 2027/2028 substitute or extra days.
"""
import json
import re
import warnings
from pathlib import Path
import holidays

ROOT = Path(__file__).resolve().parents[1]
countries = re.findall(r'^([A-Z]{2})\|([^|]+)\|', (ROOT / 'data/countries.ts').read_text(), re.M)
major = re.compile(r'songkran|new year|tet |tết|chuseok|seollal|diwali|deepavali|holi\b|eid|idul|fitr|adha|nowruz|naur(y|i)z|navruz|naadam|dashain|tihar|vesak|buddha|dragon boat|mid.autumn|christmas|independence|national day|thingyan|pchum|water festival|losar', re.I)
events, coverage, modules = [], {}, {}
warnings.filterwarnings('ignore', category=Warning)
for code, name in countries:
    for year in (2027, 2028):
        calendar = holidays.country_holidays(code, years=year, language='en_US')
        modules[code] = calendar.__class__.__module__.rsplit('.', 1)[-1]
        dates = sorted(calendar.items())
        coverage[f'{code}-{year}'] = len(dates)
        for date, title in dates:
            for index, part in enumerate(title.split('; ')):
                title_clean = re.sub(r'\s*\(estimated\)', '', part)
                events.append([code, date.isoformat(), index, title_clean, bool(major.search(title_clean))])
(ROOT / 'data/holidays.json').write_text(json.dumps({'version': holidays.__version__, 'generated': '2026-11-16', 'modules': modules, 'days': events}, ensure_ascii=False, separators=(',', ':')) + '\n')
(ROOT / 'data/coverage.json').write_text(json.dumps({'library': f'python-holidays {holidays.__version__}', 'generated': '2026-11-16', 'coverage': coverage}, indent=2) + '\n')
print(f'Generated {len(events)} records across {len(countries)} destinations; empty calendars: {[k for k,v in coverage.items() if not v]}')
