# Terapevtichno

Local source for the organization's tool directory at `https://terapevti4no.github.io/`.

A buildless HTML, CSS and JavaScript page, matching EMDR Dot's colors, typography and preference controls. The SVG logo is an original mark: two open arcs around a dot.

## Preview locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`.

## Preferences

Russian and English, light and dark themes. Preferences are saved in `localStorage` under `terapevti4no:v1`. On the first visit, existing `emdrdot:v1` theme and language are reused when available; otherwise browser preferences are used. EMDR Dot's storage record is never modified. Storage failure does not prevent using the page.

## Publishing later

Create the organization repository `terapevti4no/terapevti4no.github.io`, push this source, and select **Settings → Pages → Deploy from a branch → main → / (root)**. No build step or dependencies are required. Nothing has been published as part of the local setup.

## Editing

The tool card is in `index.html`; translations are in `app.js`; colors and layout are in `style.css`. The logo and favicon are `logo.svg` (header mark uses the same SVG paths inline).
