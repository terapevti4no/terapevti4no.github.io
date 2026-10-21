# terapevti4no

Local source for the organization's tool directory at `https://terapevti4no.github.io/`.

A buildless HTML, CSS and JavaScript page, matching EMDR Dot's colors, typography and preference controls. The SVG logo is an original mark: two open arcs around a dot.

## Preview locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`.

## Preferences

Russian and English, light and dark themes. Preferences are saved in `localStorage` under `terapevti4no:v1`. On the first visit, existing `emdrdot:v1` theme and language are reused when available; otherwise browser preferences are used. EMDR Dot's storage record is never modified. Storage failure does not prevent using the page.

## Publishing

The site is published from `main` at [terapevti4no.github.io](https://terapevti4no.github.io/). GitHub Pages serves the repository root; no build step is required.

## Editing

The tool card is in `index.html`; translations are in `app.js`; catalog-specific styles are in `style.css`. The parent-brand logo is the shared `vendor/terapevti4no-ui/assets/terapevti4no.svg#mark` symbol; its generated favicon is in the same directory. Edit the original artwork in `terapevti4no/ui`, then run the updater.

## Shared UI styles

Shared typography, theme tokens, layout and components are released in [terapevti4no/ui](https://github.com/terapevti4no/ui). The checked-in `vendor/terapevti4no-ui/ui.css` is loaded before project-specific styles. Do not edit vendor files directly.

From this project's root, with Node 22 or newer:

```sh
node scripts/update-ui.mjs --version 0.1.1
node scripts/update-ui.mjs --check --version 0.1.1
```

The updater downloads the exact GitHub release tag and records its commit and CSS SHA-256 in `vendor/terapevti4no-ui/version.json`. No local UI checkout or extra dependencies are required. Commit the vendor update after review. To roll back, use an earlier published version. Normal development, builds and site visits use the local copy and do not contact GitHub.

The parent-brand SVG is maintained in `terapevti4no/ui/assets/terapevti4no.svg`. Both headers reference that shared symbol; do not duplicate its paths in application markup. The updater installs its assets with checksums.
