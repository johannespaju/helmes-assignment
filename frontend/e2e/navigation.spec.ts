import { expect, test } from './fixtures';

test('should switch between the form and the admin page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin' })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('link', { name: 'Form' }).click();
  await expect(page.getByLabel('Name')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Form' })).toHaveAttribute('aria-current', 'page');
});
