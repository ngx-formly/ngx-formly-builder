import { expect, test } from '@playwright/test';
import { loadMaterialFixture } from './helpers/material-fixture';

test.beforeEach(async ({ page }) => {
  await page.goto('/form-editor');
  await loadMaterialFixture(page);
});

for (const action of ['Add Field', 'Replace Field']) {
  test(`${action} opens submenus on hover, including after reopening`, async ({ page }) => {
    const header = page.locator('core-formly-field-header').filter({ hasText: 'supportRequest' });

    for (let attempt = 0; attempt < 2; attempt++) {
      await header.hover();
      await header.getByRole('button', { name: action, exact: true }).click();
      await page.getByRole('menuitem', { name: 'Form Controls', exact: true }).hover();
      await expect(page.getByRole('menuitem', { name: 'Input', exact: true })).toBeVisible();
      await page.getByRole('menuitem', { name: 'Containers', exact: true }).hover();
      await expect(page.getByRole('menuitem', { name: 'Input', exact: true })).toBeHidden();
      await expect(page.getByRole('menuitem', { name: 'Repeater', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menuitem', { name: 'Containers', exact: true })).toBeHidden();
    }
  });
}

test('field panel opens successive submenu levels on hover and adds the selected field', async ({
  page,
}) => {
  const content = page.locator('core-form-builder-content');
  const initialFieldCount = await content.locator('core-formly-field-header').count();
  await page
    .locator('core-panel-field-item core-tree-item')
    .filter({ hasText: 'supportRequest' })
    .getByRole('button', { name: 'Field options', exact: true })
    .click();
  await page.getByRole('menuitem', { name: 'Add Field', exact: true }).hover();
  await page.getByRole('menuitem', { name: 'Form Controls', exact: true }).hover();
  await page.getByRole('menuitem', { name: 'Input', exact: true }).click();

  await expect(content.locator('core-formly-field-header')).toHaveCount(initialFieldCount + 1);
});

test('field submenus remain keyboard accessible', async ({ page }) => {
  const content = page.locator('core-form-builder-content');
  const initialFieldCount = await content.locator('core-formly-field-header').count();
  const header = content.locator('core-formly-field-header').filter({ hasText: 'supportRequest' });
  await header.getByRole('button', { name: 'Add Field', exact: true }).press('Enter');
  await page.getByRole('menu').press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('menuitem', { name: 'Input', exact: true })).toBeVisible();
  await page.keyboard.press('Enter');

  await expect(content.locator('core-formly-field-header')).toHaveCount(initialFieldCount + 1);
});

test.describe('touch navigation', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test('opens field submenus by tapping', async ({ page }) => {
    await page.keyboard.press('Escape');
    const content = page.locator('core-form-builder-content');
    const initialFieldCount = await content.locator('core-formly-field-header').count();
    const header = content
      .locator('core-formly-field-header')
      .filter({ hasText: 'supportRequest' });
    await header.getByRole('button', { name: 'Add Field', exact: true }).tap();
    await page.getByRole('menuitem', { name: 'Form Controls', exact: true }).tap();
    await page.getByRole('menuitem', { name: 'Input', exact: true }).tap();

    await expect(content.locator('core-formly-field-header')).toHaveCount(initialFieldCount + 1);
  });
});
