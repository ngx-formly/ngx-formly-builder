import { openWorkspaceTab } from './helpers/workspace-tab';
import { expect, test } from '@playwright/test';

test('offers one Material library with the complete field catalog', async ({ page }) => {
  await page.goto('/form-editor');
  await page.getByRole('button', { name: 'Create Form' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Create Form' });
  await expect(dialog.getByRole('combobox', { name: 'UI Library' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(page.getByRole('option', { name: 'Material', exact: true })).toHaveCount(1);
  await expect(page.getByRole('option', { name: 'Studio Material', exact: true })).toHaveCount(0);
  await page.getByRole('option', { name: 'Material', exact: true }).click();
  await dialog.getByRole('button', { name: 'Start with a blank form', exact: true }).click();
  await expect(dialog).toBeHidden();
  await openWorkspaceTab(page, 'Add Field');

  for (const name of ['Input', 'Postal Code', 'Card', 'Tabs', 'Stepper']) {
    await expect(
      page.locator('core-add-field-type-option').filter({ hasText: name }),
    ).toBeVisible();
  }
});
