import { readFile, writeFile, mkdir } from 'node:fs/promises';

// GitHub Pages has no SPA rewrite rule. Real entry files let direct visits and
// refreshes use the same shell at every supported URL with an HTTP 200 response.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const pages = {
  breaze: ['Breaze — дыхательные практики', 'Дыхательные практики с готовыми ритмами и своими настройками.'],
  emdrdot: ['EMDR Dot — визуальная стимуляция', 'Движущаяся точка и настраиваемый таймер для практики.'],
  underground: ['Underground — практика 5–4–3–2–1', 'Практика внимания к тому, что вокруг.'],
};
for (const [name, [title, description]] of Object.entries(pages)) {
  const directory = new URL(`../dist/${name}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), html
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`));
}
await writeFile(new URL('../dist/404.html', import.meta.url), html);
await writeFile(new URL('../dist/.nojekyll', import.meta.url), '');
