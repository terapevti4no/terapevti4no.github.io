import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const practices = ['breaze', 'emdrdot', 'underground'];
const home = manifest['src/App.tsx'];
const bundle = (name: string) => manifest[`src/practices/${name}/App.tsx`];

test('only the opened practice downloads its JS and CSS; navigation keeps the document', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await page.goto('/');
  await expect(page.locator('.tool-card')).toHaveCount(3);
  await page.evaluate(() => { (window as any).documentMarker = 'same-document'; });
  for (const name of practices) {
    expect(requests).not.toContain('/' + bundle(name).file);
    for (const css of bundle(name).css ?? []) expect(requests).not.toContain('/' + css);
  }
  await page.locator('a.tool-card[href="/breaze/"]').click();
  await expect(page.locator('.page-breaze .preset-card')).toHaveCount(4);
  expect(requests).toContain('/' + bundle('breaze').file);
  for (const css of bundle('breaze').css) expect(requests).toContain('/' + css);
  for (const name of ['emdrdot', 'underground']) expect(requests).not.toContain('/' + bundle(name).file);
  expect(await page.evaluate(() => (window as any).documentMarker)).toBe('same-document');
  await page.goBack();
  await expect(page.locator('.tool-card')).toHaveCount(3);
  await page.goForward();
  await expect(page.locator('.page-breaze')).toBeVisible();
  await page.getByRole('link', { name: 'All tools', exact: true }).click();
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(() => (window as any).documentMarker)).toBe('same-document');
});

for (const name of practices) {
  test(`${name}: direct link, refresh, settings and keyboard exit`, async ({ page }) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(new URL(request.url()).pathname));
    // Seed legacy settings to make sure migration does not discard them.
    await page.addInitScript(() => {
      if (!localStorage.getItem('migration-seeded')) {
        localStorage.setItem('emdrdot:v1', JSON.stringify({ lang: 'en', theme: 'dark', settings: { cycles: 7, countdown: 0 } }));
        localStorage.setItem('breaze:v1', JSON.stringify({ settings: { cycles: 3, countdown: 0 } }));
        localStorage.setItem('migration-seeded', 'true');
      }
    });
    expect((await page.goto(`/${name}/?source=direct`))?.status()).toBe(200);
    await expect(page.locator(`.page-${name} h1`)).toBeVisible();
    await expect(page).toHaveTitle(new RegExp(name === 'emdrdot' ? 'EMDR Dot' : name, 'i'));
    expect(requests).not.toContain('/' + home.file);
    for (const other of practices.filter(value => value !== name)) expect(requests).not.toContain('/' + bundle(other).file);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator(`.page-${name} h1`)).toBeVisible();
    if (name === 'breaze') {
      await expect(page.locator('#cycles')).toHaveValue('3');
      await page.locator('.preset-card').first().click();
      await expect(page.locator('.practice')).toBeVisible();
    } else if (name === 'emdrdot') {
      await expect(page.locator('#cycles')).toHaveValue('7');
      await page.getByRole('button', { name: 'Start practice', exact: true }).click();
      await expect(page.locator('.practice')).toBeVisible();
    } else {
      await page.getByRole('button', { name: 'Begin', exact: true }).click();
      await page.keyboard.press('Space');
      await expect(page.locator('.marks button[aria-pressed="true"]')).toHaveCount(1);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('.header')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('language and theme follow navigation; practice styles stay isolated', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'RU', exact: true }).click();
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await page.locator('.theme-button').click();
  const theme = await page.locator('html').getAttribute('data-theme');
  expect(theme).not.toBe(initialTheme);
  await page.locator('a.tool-card[href="/breaze/"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  const before = await page.locator('.preset-card').first().evaluate(element => ({
    gap: getComputedStyle(element).gap,
    fontSize: getComputedStyle(element).fontSize,
  }));
  for (const name of ['emdrdot', 'underground']) {
    await page.getByRole('link', { name: 'Все инструменты', exact: true }).click();
    await page.locator(`a.tool-card[href="/${name}/"]`).click();
    await expect(page.locator(`.page-${name} h1`)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme!);
  }
  await page.getByRole('link', { name: 'Все инструменты', exact: true }).click();
  await page.locator('a.tool-card[href="/breaze/"]').click();
  const after = await page.locator('.preset-card').first().evaluate(element => ({
    gap: getComputedStyle(element).gap,
    fontSize: getComputedStyle(element).fontSize,
  }));
  expect(after).toEqual(before);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme!);
});

test('a failed lazy download shows a recovery action', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tool-card')).toHaveCount(3);
  await page.route('**/' + bundle('breaze').file, route => route.abort());
  await page.locator('a.tool-card[href="/breaze/"]').click();
  await expect(page.getByRole('alert')).toContainText('Could not open this page');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.getByRole('link', { name: 'All tools' }).click();
  await expect(page.locator('.tool-card')).toHaveCount(3);
});

test('static hosting redirects slashless links, preserves queries and serves a helpful 404', async ({ page }) => {
  expect((await page.goto('/breaze?from=bookmark'))?.status()).toBe(200);
  await expect(page).toHaveURL('/breaze/?from=bookmark');
  await expect(page.locator('.preset-card')).toHaveCount(4);
  expect((await page.goto('/missing-page/'))?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'All tools' }).click();
  await expect(page.locator('.tool-card')).toHaveCount(3);
});

test('narrow screen and unavailable browser storage still allow navigation and practice', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } });
  });
  await page.goto('/underground/');
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'RU', exact: true }).click();
  await page.getByRole('link', { name: 'Все инструменты', exact: true }).click();
  await page.locator('a.tool-card[href="/underground/"]').click();
  await page.getByRole('button', { name: 'Начать', exact: true }).click();
  await page.keyboard.press('Space');
  await expect(page.locator('.marks button[aria-pressed="true"]')).toHaveCount(1);
});
