import { openWorkspaceTab } from './helpers/workspace-tab';
import { expect, test } from '@playwright/test';
import { expenseReportForm } from '../src/app/form-editor/material/material.forms';

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

test('highlights only the hovered expense line item field', async ({ page }) => {
  const form = { ...expenseReportForm, id: 'expense-report' };
  await page.addInitScript(
    (forms) => localStorage.setItem('formly-studio-forms-form-editor', forms),
    JSON.stringify({ [form.id]: form }),
  );
  await page.goto('/form-editor');
  await openWorkspaceTab(page, 'Forms');
  await page.getByRole('button', { name: 'Open form Expense Report', exact: true }).click();

  const descriptions = page.getByLabel('Field description', { exact: true });
  await expect(descriptions).toHaveCount(2);
  const headers = descriptions.locator('core-formly-field-header');
  const borders = descriptions.locator(':scope > [dndDropzone]');
  for (const index of [0, 1]) {
    await descriptions.nth(index).locator('input').hover();
    await expect(headers.nth(index)).toHaveCSS('opacity', '1');
    await expect(headers.nth(1 - index)).toHaveCSS('opacity', '0');
    await expect(borders.nth(index)).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await expect(borders.nth(1 - index)).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  }
  await page.mouse.move(0, 0);
  await expect(headers.last()).toHaveCSS('opacity', '0');
});
