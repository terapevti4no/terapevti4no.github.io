import { test, expect } from '@playwright/test';

test('thoughts can be prepared and added in an immersive practice', async ({ page }) => {
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
  await page.getByRole('button', { name: '+ Thought', exact: true }).click();
  await page.getByLabel('What thought is with you right now?').fill('New thought');
  await page.getByRole('button', { name: 'Add thought', exact: true }).click();
  await expect(page.getByLabel('What thought is with you right now?')).toBeFocused();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('.thought-cloud')).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('.cloud-thought-list li')).toHaveText(['First thought×', 'Second thought×', 'New thought×']);
  await expect(page.getByLabel('What thought is with you right now?')).toBeFocused();
  await page.getByRole('button', { name: 'Remove thought 2', exact: true }).click();
  await expect(page.locator('.cloud-thought-list li')).toHaveText(['First thought×', 'New thought×']);
});
