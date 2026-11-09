import { expect, test } from '@playwright/test';

test('Open Form Editor opens the editor without a creation dialog', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Open Form Editor' }).click();

  await expect(page).toHaveURL(/\/form-editor$/);
  await expect(page.locator('app-form-editor')).toBeVisible();
  await expect(page.locator('core-create-form-dialog')).toBeAttached();
  await expect(page.getByRole('dialog', { name: 'Create Form' })).toBeHidden();
});

test('Open Form Editor does not reopen a creation dialog after returning home', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create Form' }).click();
  await expect(page.getByRole('dialog', { name: 'Create Form' })).toBeVisible();

  await page.goBack();
  await page.getByRole('button', { name: 'Open Form Editor' }).click();

  await expect(page).toHaveURL(/\/form-editor$/);
  await expect(page.locator('app-form-editor')).toBeVisible();
  await expect(page.locator('core-create-form-dialog')).toBeAttached();
  await expect(page.getByRole('dialog', { name: 'Create Form' })).toBeHidden();

  await page.goBack();
  await page.getByRole('button', { name: 'Create Form' }).click();
  await expect(page.getByRole('dialog', { name: 'Create Form' })).toBeVisible();
});
