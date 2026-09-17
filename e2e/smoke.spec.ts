import { expect, test } from '@playwright/test';

async function getMountedMfeCount(page: import('@playwright/test').Page) {
  return page.locator('lit-mf-shell').evaluate((shell) => (
    shell.shadowRoot?.querySelectorAll('#mfe-container > *').length ?? 0
  ));
}

async function getMountedMfeTheme(page: import('@playwright/test').Page) {
  return page.locator('lit-mf-shell').evaluate((shell) => {
    const mfe = shell.shadowRoot?.querySelector<HTMLElement & { theme?: string }>(
      '#mfe-container > *',
    );
    return mfe?.theme;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => localStorage.removeItem('mfe-settings:theme'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('navigates between MFEs without duplicating mounted elements', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  expect(await getMountedMfeCount(page)).toBe(1);

  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  expect(await getMountedMfeCount(page)).toBe(1);
});

test('propagates and persists the selected theme', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByText('Tema: Claro', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Cambiar tema' }).click();
  await expect(page.getByText('Tema: Oscuro', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cambiar tema' })).toContainText('claro');

  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect.poll(() => getMountedMfeTheme(page)).toBe('dark');

  expect(await page.evaluate(() => localStorage.getItem('mfe-settings:theme'))).toBe('dark');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect.poll(() => getMountedMfeTheme(page)).toBe('dark');
});

test('restores navigation with browser history', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('renders the 404 view without leaving a mounted MFE', async ({ page }) => {
  await page.goto('/unknown');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  expect(await getMountedMfeCount(page)).toBe(0);

  await page.getByRole('link', { name: 'Volver al dashboard' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  expect(await getMountedMfeCount(page)).toBe(1);
});
