const { test, expect } = require('@playwright/test');

test('Complete a round, replay, close and keep total on an internal page', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.pest-launcher').click();
  await expect(page.locator('.pest-game')).toBeVisible();
  await expect(page.locator('.pest-game__bug')).toHaveCount(15);
  for (let i = 0; i < 15; i++) await page.locator('.pest-game__bug').first().click();
  await expect(page.locator('[data-score]')).toHaveText('15 / 15');
  await expect(page.locator('[data-total]')).toHaveText('15');
  await expect(page.locator('.pest-game__finish')).toBeVisible();
  await page.locator('.pest-game__again').click();
  await expect(page.locator('[data-score]')).toHaveText('0 / 15');
  await expect(page.locator('.pest-game__bug')).toHaveCount(15);
  await page.keyboard.press('Escape');
  await expect(page.locator('.pest-game')).toBeHidden();
  await expect(page.locator('.pest-launcher')).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await page.goto('/services/tarakany.html');
  await page.locator('header [data-lang="kz"]').click();
  await expect(page.locator('.pest-launcher')).toHaveAttribute('aria-label', 'Ойын: зиянкестерді ұста');
  await page.locator('.pest-launcher').click();
  await expect(page.locator('[data-total]')).toHaveText('15');
  await page.locator('.pest-game__close').click();
  await expect(page.locator('.pest-game')).toBeHidden();
  expect(errors).toEqual([]);
});

test('Mobile movement, touch targets, resize, keyboard capture and denied storage', async ({ page }) => {
  await page.setViewportSize({ width:320, height:640 });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage disabled'); };
    Storage.prototype.getItem = () => { throw new Error('Storage disabled'); };
  });
  await page.goto('/objects/dentistry.html');
  const launcher = await page.locator('.pest-launcher').boundingBox();
  const contacts = await page.locator('.mbb').boundingBox();
  expect(launcher.y + launcher.height).toBeLessThan(contacts.y);
  await page.locator('.pest-launcher').click();
  const bug = page.locator('.pest-game__bug').first();
  const before = await bug.getAttribute('style');
  await expect.poll(() => bug.getAttribute('style')).not.toBe(before);
  await bug.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-score]')).toHaveText('1 / 15');
  await page.setViewportSize({ width:640, height:320 });
  await expect.poll(() => page.locator('.pest-game__bug').evaluateAll(els => els.every(el => {
    const r = el.getBoundingClientRect();
    return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
  }))).toBe(true);
  await page.screenshot({ path:'artifacts/pest-game-mobile.png' });
  await page.keyboard.press('Escape');
  await expect(page.locator('.pest-game__bug')).toHaveCount(0);
});
