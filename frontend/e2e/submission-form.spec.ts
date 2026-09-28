import { Page } from '@playwright/test';

import { expect, test } from './fixtures';

function sectorsDropdown(page: Page) {
  return page.locator('details.dropdown > summary');
}

async function pickSector(page: Page, groups: string[], leaf: string): Promise<void> {
  await sectorsDropdown(page).click();
  for (const group of groups) {
    await page.getByText(group, { exact: true }).click();
  }
  await page.getByRole('checkbox', { name: leaf }).check();
  await page.keyboard.press('Escape');
}

async function fillAndSave(page: Page): Promise<void> {
  await page.getByLabel('Name').fill('Jane Doe');
  await pickSector(page, ['Manufacturing', 'Food and beverage'], 'Beverages');
  await page.getByLabel('Agree to terms').check();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status')).toHaveText('Saved.');
}

test('should refill the form with the saved data after a reload', async ({ page }) => {
  await page.goto('/');
  await fillAndSave(page);

  await page.reload();

  await expect(page.getByLabel('Name')).toHaveValue('Jane Doe');
  await expect(page.getByRole('list', { name: 'Selected sectors' })).toHaveText(/Beverages/);
  await expect(page.getByLabel('Agree to terms')).toBeChecked();
});

test('should update the same submission when saving again in the session', async ({ page, api }) => {
  await page.goto('/');
  await fillAndSave(page);
  const [id] = api.submissions.keys();

  await page.getByLabel('Name').fill('Jane Smith');
  await page.getByRole('button', { name: 'Remove Beverages' }).click();
  await pickSector(page, ['Service'], 'Tourism');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect.poll(() => api.submissions.get(id)?.name).toBe('Jane Smith');
  expect(api.submissions.get(id)?.sectorIds).toEqual(['tourism']);
  expect(api.submissions.size).toBe(1);
});

test('should start with an empty form in a new tab', async ({ page, context }) => {
  await page.goto('/');
  await fillAndSave(page);

  const newTab = await context.newPage();
  await newTab.goto('/');

  await expect(newTab.getByLabel('Name')).toHaveValue('');
  await expect(newTab.getByLabel('Agree to terms')).not.toBeChecked();
});

test('should let the sectors dropdown be used with the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Name').focus();

  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');

  await expect(page.getByRole('list', { name: 'Selected sectors' })).toHaveText(/Bakery/);
});

test('should close the sectors dropdown on Escape and give focus back', async ({ page }) => {
  await page.goto('/');
  await sectorsDropdown(page).click();
  await page.getByText('Manufacturing', { exact: true }).focus();

  await page.keyboard.press('Escape');

  await expect(page.getByText('Manufacturing')).toBeHidden();
  await expect(sectorsDropdown(page)).toBeFocused();
});

test('should close the sectors dropdown on a click outside it', async ({ page }) => {
  await page.goto('/');
  await sectorsDropdown(page).click();

  await page.getByLabel('Name').click();

  await expect(page.getByText('Manufacturing')).toBeHidden();
});
