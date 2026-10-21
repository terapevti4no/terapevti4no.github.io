# terapevti4no

React + TypeScript + Vite tool directory at https://terapevti4no.github.io/.

## Development

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173/. Build: `npm run build`; production preview: `npm run preview`. Node 22+; CI uses Node 24. The deployed output is static and needs no application server.

## Add an instrument

Add one record to `src/tools.ts`: id, name, URL and Russian/English category, description and feature list. `ToolCatalog` renders a `ToolCard` for each record. The EMDR wordmark comes from the UI library; instruments without a custom logo can use their name. Page translations are in `src/i18n.ts`, catalog-specific styles in `src/style.css`.

## Shared UI

`@terapevti4no/ui` supplies the layout, header, logos, theme/language controls, text-only page intro, content container, information note and footer. It is installed from a versioned npm archive in [GitHub Releases](https://github.com/terapevti4no/ui/releases), with integrity pinned in `package-lock.json`. Do not copy library code or SVG paths into this project. There is no vendor directory.

```sh
npm run ui:check
npm run ui:update -- --latest
npm run ui:update -- --version 0.2.1
```

Normal builds and site visits use the installed package. Only an explicit dependency update needs GitHub access. See the UI repository for component APIs and release instructions.

## Preferences

Existing `terapevti4no:v1` language/theme records are preserved. On first use, missing fields fall back to `emdrdot:v1`, then browser preferences. The shared hook merges fields and never changes the EMDR timer settings. A shared-generated blocking head script applies the saved theme before first paint. The page also works when browser storage is disabled.

## Publication and automatic UI updates

GitHub Pages uses **GitHub Actions**, serving the Vite `dist` artifact. Pushes and pull requests run the build; only `main` deploys. The workflow also checks for new stable UI releases four times an hour, builds the updated project, commits its package/lockfile update and deploys in the same run. Scheduled timing is controlled by GitHub and may be delayed. An unsuccessful update does not get committed or published.

Run **Build and deploy** (`pages.yml`) manually to check/update/deploy immediately. Set repository variable `UI_AUTO_UPDATE=false` to pause scheduled checks; pushes/manual runs still work. For a rollback, disable scheduled updates, install an earlier compatible UI version, verify and commit the package files.
