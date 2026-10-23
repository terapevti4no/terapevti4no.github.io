import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const practices = ['breaze', 'emdrdot', 'underground'];
const home = manifest['src/App.tsx'];
const bundle = (name: string) => manifest[`src/practices/${name}/App.tsx`];

test('the same header and controls remain mounted while a lazy page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tool-card')).toHaveCount(4);
  const header = await page.locator('.header').elementHandle();
  const language = await page.getByRole('button', { name: 'RU', exact: true }).elementHandle();
  const theme = await page.locator('.theme-button').elementHandle();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/' + bundle('breaze').file, async route => { await gate; await route.continue(); });
  const loading = page.waitForRequest('**/' + bundle('breaze').file);
  try {
    await page.locator('a.tool-card[href="/breaze/"]').click();
    await loading;
    await expect(page.getByRole('status')).toHaveText('Loading…');
    await expect(page.locator('.header')).toBeVisible();
    expect(await page.evaluate(element => element === document.querySelector('.header'), header)).toBe(true);
    await page.getByRole('button', { name: 'RU', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Загрузка…');
  } finally { release(); }
  await expect(page.locator('.preset-card')).toHaveCount(4);
  await expect(page.locator('.header .tool-logo')).toHaveAttribute('aria-label', 'Breaze');
  for (const name of ['emdrdot', 'underground']) {
    await page.getByRole('link', { name: 'Все инструменты', exact: true }).click();
    await page.locator(`a.tool-card[href="/${name}/"]`).click();
    await expect(page.locator(`.page-${name} h1`)).toBeVisible();
    expect(await page.evaluate(element => element === document.querySelector('.header'), header)).toBe(true);
    expect(await page.evaluate(element => element === document.querySelector('.languages button'), language)).toBe(true);
    expect(await page.evaluate(element => element === document.querySelector('.theme-button'), theme)).toBe(true);
    await expect(page.locator('.header')).toHaveCount(1);
  }
  await page.goBack();
  await expect(page.locator('.tool-card')).toHaveCount(4);
  await page.goForward();
  await expect(page.locator('.page-underground h1')).toBeVisible();
  expect(await page.evaluate(element => element === document.querySelector('.header'), header)).toBe(true);
});

test('browser history restores the existing header when leaving an active exercise', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.tool-card[href="/underground/"]').click();
  const header = await page.locator('.header').elementHandle();
  await page.getByRole('button', { name: 'Begin', exact: true }).click();
  await expect(page.locator('.header')).toBeHidden();
  await page.goBack();
  await expect(page.locator('.tool-card')).toHaveCount(4);
  await expect(page.locator('.header')).toBeVisible();
  expect(await page.evaluate(element => element === document.querySelector('.header'), header)).toBe(true);
});

test('only the opened practice downloads its JS and CSS; navigation keeps the document', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await page.goto('/');
  await expect(page.locator('.tool-card')).toHaveCount(4);
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
  await expect(page.locator('.tool-card')).toHaveCount(4);
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
    const header = await page.locator('.header').elementHandle();
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
    await expect(page.locator('.header')).toHaveCount(1);
    await expect(page.locator('.header')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('.header')).toBeVisible();
    expect(await page.evaluate(element => element === document.querySelector('.header'), header)).toBe(true);
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
  await expect(page.locator('.tool-card')).toHaveCount(4);
  await page.route('**/' + bundle('breaze').file, route => route.abort());
  await page.locator('a.tool-card[href="/breaze/"]').click();
  await expect(page.getByRole('alert')).toContainText('Could not open this page');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.locator('.header')).toBeVisible();
  await page.getByRole('alert').getByRole('link', { name: 'All tools' }).click();
  await expect(page.locator('.tool-card')).toHaveCount(4);
});

test('static hosting redirects slashless links, preserves queries and serves a helpful 404', async ({ page }) => {
  expect((await page.goto('/breaze?from=bookmark'))?.status()).toBe(200);
  await expect(page).toHaveURL('/breaze/?from=bookmark');
  await expect(page.locator('.preset-card')).toHaveCount(4);
  expect((await page.goto('/missing-page/'))?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'All tools' }).click();
  await expect(page.locator('.tool-card')).toHaveCount(4);
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

for (const name of practices) {
  test(`${name}: shared icon controls have tooltips and still pause, resume and close`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${name}/`);
    await page.getByRole('button', { name: 'RU', exact: true }).click();
    if (name === 'breaze') await page.locator('.preset-card').first().click();
    else if (name === 'emdrdot') await page.locator('.start-button').click();
    else await page.getByRole('button', { name: 'Начать', exact: true }).click();
    const controls = page.locator('.practice-controls');
    const close = controls.getByRole('button', { name: 'Завершить', exact: true });
    await expect(close).toHaveAttribute('title', 'Завершить');
    await expect(close).toHaveText('');
    await expect(close).toHaveCSS('width', '44px');
    await expect(close).toHaveCSS('height', '44px');
    if (name !== 'underground') {
      const pause = controls.getByRole('button', { name: 'Пауза', exact: true });
      await expect(pause).toHaveAttribute('title', 'Пауза');
      await expect(pause).toHaveText('');
      await expect(pause).toHaveCSS('width', '44px');
      await pause.click();
      const resume = controls.getByRole('button', { name: 'Продолжить', exact: true });
      await expect(resume).toHaveAttribute('title', 'Продолжить');
      await expect(resume).toHaveAttribute('aria-pressed', 'true');
      await resume.click();
      await expect(pause).toHaveAttribute('aria-pressed', 'false');
    } else {
      const skip = controls.getByRole('button', { name: 'Пропустить', exact: true });
      await expect(skip).toHaveAttribute('title', 'Пропустить');
      await expect(skip).toHaveText('');
      await expect(skip).toHaveCSS('width', '44px');
      await skip.click();
      await expect(page.locator('.marks button[aria-pressed]')).toHaveCount(4);
    }
    await close.click();
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator(`.page-${name} h1`)).toBeVisible();
  });
}
