import { test, expect } from '@playwright/test';

test('thoughts can be prepared and added through the persistent practice input', async ({ page }) => {
  await page.goto('/cloudbye/');
  await expect(page.locator('#cloud-thought')).toBeFocused();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Begin', exact: true })).toBeDisabled();
  await page.getByLabel('What thought is with you right now?').fill('First thought');
  await page.getByRole('button', { name: 'Add thought', exact: true }).click();
  await expect(page.getByLabel('What thought is with you right now?')).toBeFocused();
  await expect(page.locator('.cloud-thought-list')).toHaveText('First thought×');
  await page.getByLabel('What thought is with you right now?').fill('Second thought');
  await page.getByRole('button', { name: 'Begin', exact: true }).click();
  await expect(page.locator('.header')).toBeHidden();
  await expect(page.locator('.thought-cloud')).toHaveText('First thought');
  const input = page.getByRole('textbox', { name: 'New thought', exact: true });
  await expect(input).toBeVisible();
  await expect(page.locator('#cloud-wind-hint')).toBeVisible();
  await expect(page.locator('.cloud-practice button')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Add thought', exact: true })).toBeDisabled();
  await input.fill('New thought');
  await page.getByRole('button', { name: 'Add thought', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page.locator('.thought-cloud')).toHaveText(['First thought', 'New thought']);
  await page.getByRole('button', { name: 'Close practice', exact: true }).click();
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('.cloud-thought-list li')).toHaveText(['First thought×', 'Second thought×', 'New thought×']);
  await expect(page.getByLabel('What thought is with you right now?')).toBeFocused();
  await page.getByRole('button', { name: 'Remove thought 2', exact: true }).click();
  await expect(page.locator('.cloud-thought-list li')).toHaveText(['First thought×', 'New thought×']);
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`cloud journey advances once and typing never pauses the sky (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/cloudbye/');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    const input = page.getByLabel('What thought is with you right now?');
    await input.fill('First cloud');
    await page.getByRole('button', { name: 'Add thought', exact: true }).click();
    await input.fill('Second cloud');
    await page.getByRole('button', { name: 'Begin', exact: true }).click();
    // Finishing the text fade must not skip the current thought.
    await page.locator('.thought-cloud p').evaluate(element => element.getAnimations()[0].finish());
    await expect(page.locator('.thought-cloud')).toHaveText('First cloud');
    await page.getByRole('textbox', { name: 'New thought', exact: true }).fill('An unfinished thought');
    const states = await page.locator('.cloud-practice').evaluate(el => el.getAnimations({ subtree: true }).map(animation => animation.playState));
    expect(states.length).toBeGreaterThan(0);
    expect(states.every(state => state === 'running' || state === 'finished')).toBe(true);
    await page.locator('.thought-cloud').evaluate(element => element.getAnimations()[0].finish());
    await expect(page.locator('.thought-cloud')).toHaveText('Second cloud');
    await expect(page.getByRole('textbox', { name: 'New thought', exact: true })).toHaveValue('An unfinished thought');
  });

  test(`new thoughts appear immediately and preserve playback (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/cloudbye/');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    const input = page.getByLabel('What thought is with you right now?');
    await input.fill('Original thought');
    await page.getByRole('button', { name: 'Add thought', exact: true }).click();
    await input.fill('Queued thought');
    await page.getByRole('button', { name: 'Begin', exact: true }).click();
    const original = await page.locator('.thought-cloud').elementHandle();
    await original!.evaluate(el => { el.getAnimations()[0].currentTime = 12000; });
    const practiceInput = page.getByRole('textbox', { name: 'New thought', exact: true });
    await practiceInput.fill('A new thought');
    await practiceInput.press('Enter');
    await expect(practiceInput).toBeVisible();
    await expect(practiceInput).toHaveValue('');
    await expect(practiceInput).toBeFocused();
    await expect(page.locator('.thought-cloud')).toHaveText(['Original thought', 'A new thought']);
    expect(await original!.evaluate(el => el === document.querySelector('.is-leaving .thought-cloud'))).toBe(true);
    expect(await original!.evaluate(el => Number(el.getAnimations()[0].currentTime))).toBeGreaterThanOrEqual(12000);
    const states = await page.locator('.cloud-sky').evaluate(el => el.getAnimations({ subtree: true }).map(animation => animation.playState));
    expect(states.every(state => state === 'running' || state === 'finished')).toBe(true);
    // A departing cloud ends independently and never advances the new thought.
    await page.locator('.cloud-slot.is-leaving').evaluate(el => el.getAnimations()[0].finish());
    await expect(page.locator('.cloud-slot.is-leaving')).toHaveCount(0);
    await expect(page.locator('.thought-cloud')).toHaveText('A new thought');
    await page.locator('.thought-cloud').evaluate(el => el.getAnimations()[0].finish());
    await expect(page.locator('.thought-cloud')).toHaveText('Queued thought');
  });
}


for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`clicks behind and ahead create temporary local gusts (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/cloudbye/');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await page.getByLabel('What thought is with you right now?').fill('Original thought');
    await page.getByRole('button', { name: 'Begin', exact: true }).click();
    await expect(page.getByRole('slider')).toHaveCount(0);
    const original = await page.locator('.thought-cloud').elementHandle();
    await original!.evaluate(el => { el.getAnimations()[0].currentTime = 12000; });
    const rate = () => original!.evaluate(el => el.getAnimations()[0]?.playbackRate);
    let bounds = await original!.boundingBox();
    // The air just beyond the soft edge works, not only the HTML element itself.
    await page.mouse.click(bounds!.x - 95, bounds!.y + bounds!.height / 2);
    await expect.poll(rate).toBeGreaterThan(1.1);
    const elapsed = await original!.evaluate(el => Number(el.getAnimations()[0].currentTime));
    expect(elapsed).toBeGreaterThanOrEqual(12000);
    expect(elapsed).toBeLessThan(14000);
    bounds = await original!.boundingBox();
    await page.mouse.click(bounds!.x + bounds!.width + 95, bounds!.y + bounds!.height / 2);
    await expect.poll(rate).toBeLessThan(.9);
    const backgroundRates = await page.locator('.cloud-distance, .cloud-light').evaluateAll(elements => elements.flatMap(el => el.getAnimations().map(animation => animation.playbackRate)));
    expect(backgroundRates.every(value => value === 1)).toBe(true);
    await expect.poll(rate, { timeout: 8000 }).toBe(1);
    await expect(page.locator('.cloud-gust')).toHaveCount(0);
    await original!.evaluate(el => el.getAnimations()[0].finish());
    await expect.poll(() => page.locator('.thought-cloud').evaluate(el => el.getAnimations()[0].playbackRate)).toBe(1);
  });
}

test('touching a cloud changes only its own speed while another is leaving', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.goto('/cloudbye/');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await page.getByLabel('What thought is with you right now?').fill('Original thought');
    await page.getByRole('button', { name: 'Begin', exact: true }).click();
    await page.locator('.thought-cloud').evaluate(el => { el.getAnimations()[0].currentTime = 12000; });
    await page.getByRole('textbox', { name: 'New thought', exact: true }).fill('A new thought');
    await page.getByRole('button', { name: 'Add thought', exact: true }).click();
    await page.locator('.is-leaving').evaluate(el => { el.getAnimations()[0].currentTime = 4000; });
    await page.locator('.is-new').evaluate(el => { el.getAnimations()[0].currentTime = 8000; });
    const cloud = page.locator('.is-new .thought-cloud');
    await cloud.evaluate(el => { el.getAnimations()[0].currentTime = 12000; });
    const rate = () => cloud.evaluate(el => el.getAnimations()[0].playbackRate);
    let bounds = await cloud.boundingBox();
    await page.touchscreen.tap(bounds!.x + bounds!.width * .2, bounds!.y + bounds!.height / 2);
    await expect.poll(rate).toBeGreaterThan(1.1);
    expect(await page.locator('.is-leaving .thought-cloud').evaluate(el => el.getAnimations()[0].playbackRate)).toBe(1);
    bounds = await cloud.boundingBox();
    await page.touchscreen.tap(bounds!.x + bounds!.width * .8, bounds!.y + bounds!.height / 2);
    await expect.poll(rate).toBeLessThan(.9);
    expect(await page.locator('.is-leaving .thought-cloud').evaluate(el => el.getAnimations()[0].playbackRate)).toBe(1);
    await cloud.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(rate).toBeGreaterThan(1.1);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(rate).toBeLessThan(.9);
  } finally { await context.close(); }
});
