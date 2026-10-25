import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage sections, internal routes and responsive accessibility', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Advancing Spatial Intelligence & Computational Vision');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
  }
  await page.getByRole('link', { name: 'Explore this area' }).first().click();
  await expect(page).toHaveURL(/research\/computer-vision$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Computer Vision');
  expect(errors).toEqual([]);
});

test('mobile navigation supports Escape, focus return and route close', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const summary = page.locator('summary');
  await summary.click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(summary).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible();
  await summary.click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Research Areas' }).click();
  await expect(page.locator('#research')).toBeInViewport();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible();
});

test('goal stages, reduced motion and scene unmount/remount', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const goal = page.locator('.scene-goal');
  await goal.scrollIntoViewIfNeeded();
  await expect(goal.locator('.scene-viewport')).toHaveAttribute('data-state', /ready|failed/);
  await goal.getByLabel('02 Understand').check();
  await expect(goal.getByLabel('02 Understand')).toBeChecked();
  await expect(goal.locator('.scene-description')).toContainText('three-dimensional volume');
  await goal.getByLabel('03 Apply').check();
  await expect(goal.locator('.scene-description')).toContainText('spatial helix');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore this area' }).first().click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'All research areas' }).click();
  await page.locator('.scene-hero').scrollIntoViewIfNeeded();
  await expect(page.locator('.scene-hero canvas')).toHaveCount(1);
});

test('WebGL failure keeps the poster and functional stage selection', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(type: string, ...args: unknown[]) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
        return Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto('/');
  const goal = page.locator('.scene-goal');
  await goal.scrollIntoViewIfNeeded();
  await expect(goal.locator('.scene-viewport')).toHaveAttribute('data-state', 'failed');
  await goal.getByLabel('03 Apply').check();
  await expect(goal.getByRole('img')).toHaveAccessibleName(/Apply/);
  await expect(goal.getByRole('button', { name: 'Retry 3D' })).toBeVisible();
});

test('no-JavaScript visitors retain text, navigation and static illustrations', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/');
  await page.locator('summary').click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Advancing the Science of Visual Intelligence' })).toBeVisible();
  await expect(page.locator('.scene-poster svg')).toHaveCount(3);
  await expect(page.locator('form')).toHaveCount(0);
  await context.close();
});

test('invalid routes, safe joining redirect and real response security headers', async ({ page, request }) => {
  const response = await page.goto('/research/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible();
  const redirect = await request.get('/join-us', { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe('/join');
  const first = await request.get('/');
  const second = await request.get('/');
  expect(first.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(first.headers()['content-security-policy']).not.toMatch(/unsafe-inline|unsafe-eval/);
  expect(first.headers()['content-security-policy']).not.toBe(second.headers()['content-security-policy']);
  expect(first.headers()['x-content-type-options']).toBe('nosniff');
});
