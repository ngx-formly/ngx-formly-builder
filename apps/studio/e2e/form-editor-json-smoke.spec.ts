import { openWorkspaceTab } from './helpers/workspace-tab';
import { loadMaterialFixture as createContactForm } from './helpers/material-fixture';
import { expect, test } from '@playwright/test';

test('Form Editor import: imports supported field configuration into the builder', async ({
  page,
}) => {
  await page.goto('/form-editor');

  await openWorkspaceTab(page, 'Forms');
  await page.getByRole('button', { name: 'Import Form' }).click();

  const dialog = page.getByRole('dialog', { name: 'Import Form' });
  await expect(dialog).toBeVisible();

  await dialog.locator('input[name="name"]').fill('Imported Smoke Form');
  await dialog
    .locator('core-json-content .cm-content')
    .fill('[{"type":"input","key":"email","props":{"label":"Imported Email"}}]');
  await dialog.getByRole('button', { name: 'Import Form' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText('Imported Smoke Form', { exact: true })).toBeVisible();
  await expect(page.locator('core-form-builder-content')).toContainText('Imported Email');
  await expect(page.locator('core-form-builder-content core-vanilla-field input')).toBeVisible();
});

test('Form Editor JSON smoke: shows field configuration and returns to component view', async ({
  page,
}) => {
  await page.goto('/form-editor');

  await createContactForm(page);

  await expect(page.getByRole('button', { name: 'JSON' })).toBeVisible();
  await page.getByRole('button', { name: 'JSON' }).click();

  const jsonEditor = page.locator('core-json-content .cm-content');
  await expect(jsonEditor).toBeVisible();
  await expect(jsonEditor).toHaveAttribute('contenteditable', 'false');
  await expect(jsonEditor).toContainText('"label": "Customer name"');

  await page.getByRole('button', { name: 'Builder', exact: true }).click();
  await expect(jsonEditor).toBeHidden();
  await expect(
    page.locator('core-form-builder-content').getByText('supportRequest', { exact: true }),
  ).toBeVisible();
});

test('Form Editor JSON validation: rejects invalid import JSON', async ({ page }) => {
  await page.goto('/form-editor');

  await openWorkspaceTab(page, 'Forms');
  await page.getByRole('button', { name: 'Import Form' }).click();

  const importDialog = page.getByRole('dialog', { name: 'Import Form' });
  await expect(importDialog).toBeVisible();
  await importDialog.locator('core-json-content .cm-content').fill('[{"type":');
  await expect(importDialog.getByText('JSON format is not valid')).toBeVisible();
  await expect(importDialog.getByRole('button', { name: 'Import Form' })).toBeDisabled();
});

test('Form Editor preview: opens an end-user dialog without edit controls', async ({ page }) => {
  await page.goto('/form-editor');

  await createContactForm(page);
  await page.getByRole('button', { name: 'Open preview' }).click();

  const previewDialog = page.getByRole('dialog', { name: 'Form Preview' });
  await expect(previewDialog).toBeVisible();
  const previewFrame = previewDialog.frameLocator('iframe[title="Responsive form preview"]');
  await expect(previewFrame.locator('input, textarea, [role="combobox"]').first()).toBeVisible();
  await expect(previewDialog.getByRole('button', { name: 'Add Field' })).toHaveCount(0);
  await expect(previewDialog.getByRole('button', { name: 'Options' })).toHaveCount(0);
});

test('Form Editor deletion recovery: clears the active field after removal', async ({ page }) => {
  await page.goto('/form-editor');

  await createContactForm(page);

  const nestedField = page
    .locator('core-formly-field-header')
    .filter({ hasText: 'customerName' })
    .last();
  await nestedField.hover();
  await nestedField.click();

  await nestedField.getByRole('button', { name: 'Options' }).click();
  await page.getByRole('menuitem', { name: 'Remove' }).click();

  await expect(page.locator('core-form-builder-content [aria-pressed="true"]')).toHaveCount(0);
});

test('Form Editor authoring: adds a group and a nested field', async ({ page }) => {
  await page.goto('/form-editor');

  await createContactForm(page);
  const formContent = page.locator('core-form-builder-content');
  const initialFieldCount = await formContent.locator('core-formly-field-header').count();
  await openWorkspaceTab(page, 'Add Field');

  const groupSource = page
    .locator('core-type-container')
    .filter({ has: page.getByText('Group', { exact: true }) });
  await groupSource.dragTo(formContent);

  await expect(formContent).toContainText('Group');
  await expect(formContent.locator('core-formly-field-header')).toHaveCount(initialFieldCount + 1);

  await formContent
    .locator('core-formly-field-header')
    .filter({ hasText: /^.*Group.*$/ })
    .last()
    .getByRole('button', { name: 'Add Field' })
    .click();
  await page.getByRole('menuitem', { name: 'Form Controls' }).hover();
  await page.getByRole('menuitem', { name: 'Input' }).click();

  await expect(formContent).toContainText('Group');
  await expect(formContent.locator('core-formly-field-header')).toHaveCount(initialFieldCount + 2);
});

test('Form Editor authoring: renames the active form from the navbar', async ({ page }) => {
  await page.goto('/form-editor');

  await createContactForm(page);
  const navbar = page.locator('app-header');
  await navbar.getByRole('button', { name: 'Rename form: New Form' }).click();

  const nameInput = navbar.getByRole('textbox', { name: 'Form name' });
  await expect(nameInput).toBeFocused();
  await nameInput.fill('Renamed Smoke Form');
  await page.getByRole('button', { name: 'Builder', exact: true }).click();

  const title = navbar.getByRole('button', { name: 'Rename form: Renamed Smoke Form' });
  await expect(title).toBeVisible();

  await title.press('Enter');
  await expect(nameInput).toBeFocused();
  await nameInput.fill('Discarded Name');
  await nameInput.press('Escape');
  await expect(title).toBeFocused();

  await title.press('Enter');
  await nameInput.fill('Keyboard Rename');
  await nameInput.press('Enter');
  await expect(navbar.getByRole('button', { name: 'Rename form: Keyboard Rename' })).toBeFocused();
  await page.reload();
  await expect(navbar.getByRole('button', { name: 'Rename form: Keyboard Rename' })).toBeVisible();
});

test('Form Editor folders: creates a folder and adds a form inside it', async ({ page }) => {
  await page.goto('/form-editor');

  await page.getByRole('button', { name: 'New folder' }).click();

  const folderItem = page.locator('core-tree-item').filter({ hasText: 'New Folder' });
  await expect(folderItem).toBeVisible();

  // Hover folder to reveal actions and add a form inside the new folder
  await folderItem.hover();
  await folderItem.getByRole('button', { name: 'Options', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Add Form' }).click();

  // Adding a form inside a folder opens the creation dialog with that folder selected.
  await expect(page.getByRole('dialog', { name: 'Create Form' })).toBeVisible();
});
