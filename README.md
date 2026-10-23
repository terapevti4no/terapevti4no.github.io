# terapevti4no

One React + TypeScript + Vite application for https://terapevti4no.space/.
The catalog and practices share React, routing, preferences and a local UI package.

## Development

Use Node 24 (also used in CI):

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173/. Production build: `npm run build`; preview: `npm run preview`.

```text
src/App.tsx               Catalog page
src/Router.tsx            React Router routes and dynamic imports
src/practices/breaze/     Breathing practice, settings and timer tests
src/practices/emdrdot/    Visual stimulation, settings and timer tests
src/practices/underground/ Grounding practice
packages/ui/              Shared components, CSS, preferences and brand assets
```

## Loading and navigation

React Router uses browser history and preserves the existing URLs: `/`, `/breaze/`,
`/emdrdot/`, `/underground/`. Internal links navigate without a document reload.
Each page is imported with `React.lazy`; its JavaScript and CSS download only on
first visit. React, the router and shared UI load once. Practice styles are scoped
to `.page-breaze`, `.page-emdrdot` or `.page-underground` so previously downloaded
CSS cannot affect other practices. Use these scopes for new styles too.

`npm run build` also generates a real `index.html` under each practice directory.
This preserves direct links, refreshes, query strings and successful HTTP status
codes on GitHub Pages without hash URLs or a redirect workaround. Unknown paths
use `404.html` and display a link to the catalog.

## Shared UI and preferences

`@terapevti4no/ui` is an npm workspace in `packages/ui`; edit it directly. No UI
release, GitHub archive or scheduled dependency update is needed. Assets and the
pre-paint theme bootstrap come from this local package.

A single `PreferencesProvider` keeps language and theme consistent during
navigation, even if browser storage is unavailable. It stores them in
`terapevti4no:v1`, falling back to legacy `emdrdot:v1`, `breaze:v1` and
`underground:v1` fields when missing, then browser preferences. Existing practice
settings stay under their original keys. On another origin, browser storage
remains separate, as before. Active practice progress stays in memory; leaving a
practice stops it and returning opens its settings.

## Add a practice

1. Add its component and scoped CSS in `src/practices/<name>/`.
2. Add a dynamic import and route in `src/Router.tsx`.
3. Add the catalog record with a local URL in `src/tools.ts`.
4. Add its static entry metadata in `scripts/build-pages.mjs` and navigation tests.

## Checks and publication

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests use a static server with the same directory/404 behavior as Pages.
They check dynamic JS/CSS requests, direct links, refreshes, browser history,
shared preferences, legacy timer settings, keyboard controls, error recovery and
narrow screens. To use an existing Chromium installation, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable.

GitHub Actions runs checks for pushes and PRs. Only `main` deploys the complete
`dist` artifact to the existing GitHub Pages site and custom domain. No schedule
or cross-repository UI updates are required.

The original `breaze`, `emdrdot`, `underground` and `ui` repositories are retained.
See [MIGRATION.md](MIGRATION.md) for the imported source versions and cutover.
