# Atlas Asia

A personal, mobile-friendly Asia travel planner for **2027–2028**, built with **Next.js App Router, TypeScript and React**, with an **Indian passport** perspective.

## Database and hosting

No external database, API key, account service or paid backend is needed. Country guides and holiday records are version-controlled files. Next.js exports HTML, CSS, JavaScript, fonts and images into `out/`; GitHub Pages serves those static files.

Favourites, visited destinations and notes are stored in the visitor's browser (`localStorage`). They do not sync automatically across devices. The Backup and Import controls export JSON and safely merge it into another browser. No personal notes are committed to this repository.

## Features

- 52 Asian travel destinations, grouped by region and searchable by country, city or food.
- Monthly grid and agenda calendars for 2027 and 2028; multi-day and cross-month events.
- Country and event-type filters, major-celebration highlights, and date-status labels.
- Country guides: food, transport, Indian-passport entry references, seasonality, relative costs, solo travel and essentials.
- Compare up to three destinations.
- Saved countries, saved events, visited status and personal country notes.
- RFC 5545 `.ics` exports for individual events, filtered months and saved events.
- JSON backup/import. Import merges rather than replacing existing saved plans.
- Keyboard-accessible dialogs, focus indicators, reduced-motion support and mobile layouts.

## Run locally

Use Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For a production static preview:

```sh
npm test
npm run build
npm run preview
```

`npm run build` is the production type and static-export check. `npm test` verifies data integrity, calendar date boundaries, leap years, iCalendar escaping and UTF-8 line folding, and backup validation/merging.

## Publish free on GitHub Pages

The included `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.

For the initial browser-based upload, the workflow can unpack `atlas-asia-source.zip` once if `package.json` is absent, commit the unpacked source, and then continue the normal build. Subsequent builds use the ordinary source files; the bootstrap does not run again. The build job's repository write permission is used only for that first source commit.

1. Create a public repository and push this project's source to its `main` branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Run **Deploy to GitHub Pages** or push a commit to `main`.

The workflow sets the correct Next.js base path automatically. A project repository such as `atlas-asia` publishes at `https://OWNER.github.io/atlas-asia/`. A user-site repository such as `OWNER.github.io` publishes at the domain root.

The workflow uses only GitHub's short-lived built-in deployment credentials. No personal token should be added to the source or configured as a public environment variable.

For a manual project-path build:

```sh
NEXT_PUBLIC_BASE_PATH=/atlas-asia npm run build
```

## Content and coverage

### Directory

Regional groupings use [UN M49](https://unstats.un.org/unsd/methodology/m49/), with Russia and Taiwan added as travel destinations. Hong Kong and Macao are separately labelled destinations. Groupings are for navigation rather than political status.

### Holidays and festivals

- `data/holidays.json`: calculated national public holidays from [python-holidays 0.83](https://holidays.readthedocs.io/), generated for 2027 and 2028. **All generated future dates are labelled projected**, regardless of whether the underlying rule is fixed or lunar. Sources point to the package's country-specific documentation and references.
- `data/festivals.ts`: selected editorial cultural and seasonal entries, linked to JNTO, the Government of Thailand and UNESCO. An annual tradition is not a confirmed year-specific programme. Cherry blossom dates represent a broad seasonal window, not a forecast.
- `lib/events.ts`: combines the sources and avoids duplicate Songkran/Naadam entries. Sri Lanka's upstream calendar has no future-year table; only five selected fixed-date annual holidays per year are added as projected dates. **Sri Lankan Poya and other lunar holidays are not yet covered.**
- `data/coverage.json`: records raw source coverage before the Sri Lankan additions and curated entries.

This is a planning calendar, not a complete list of every local festival, regional holiday or government-declared extra day. “Major celebration” is an editorial designation rather than a popularity score.

To regenerate the national dataset, install the pinned Python dependency in an isolated environment:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
.venv/bin/python scripts/generate_holidays.py
npm test
npm run build
```

Refresh the preparation date in the generator and review library changes when refreshing data. Node/Python libraries are authoring tools only; the deployed site runs entirely in the browser.

### Country guides

`data/countries.ts` contains editorial summaries and direct official entry links. Relative cost profiles are broad planning notes; **live daily budgets, exchange rates, visa fees and processing-time promises are not provided**. Seasonality is general, not a forecast.

Only entry summaries with `checked` dates were reviewed against official sources. Nepal, Bhutan, Japan, Maldives and Hong Kong have reviewed summaries as of 16 November 2026; the remainder deliberately say that 2027–2028 eligibility has not been verified. Recheck the linked immigration authority for travel dates rather than assuming future entry rules.

## Assets and credits

- Kyoto photograph: [traditional house during daytime on Unsplash](https://unsplash.com/photos/traditional-house-during-daytime-Xq1ntWruZQI), under the [Unsplash licence](https://unsplash.com/license).
- DM Sans and Libre Caslon Display: bundled locally under the SIL Open Font License; see `app/fonts/`.
- Icons: [Lucide](https://lucide.dev/), ISC licence.
- Holiday calculations: [python-holidays](https://github.com/vacanza/holidays), MIT licence; included in `THIRD_PARTY_NOTICES.md`.

## Verification limits

The production export and automated logic checks can be run without a browser. Local browser-preview access was declined during authoring, so visual layout and interactive browser QA have not been verified. The responsive layouts are implemented but still need a real browser review.
