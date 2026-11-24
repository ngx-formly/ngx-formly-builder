import { expect, test } from '@playwright/test';
import { loadMaterialFixture } from './helpers/material-fixture';

test.beforeEach(async ({ page }) => {
  await page.goto('/form-editor');
  await loadMaterialFixture(page);
});

test('reveals only the hovered field controls without shifting the form', async ({ page }) => {
  const field = page.getByLabel('Field customerName', { exact: true });
  const header = field.locator('core-formly-field-header');
  const visibleHeaders = () =>
    page
      .locator('core-formly-field-header')
      .evaluateAll(
        (headers) => headers.filter((header) => getComputedStyle(header).opacity === '1').length,
      );
  const sibling = page.getByLabel('Field reference', { exact: true });
  await page.mouse.move(0, 0);
  await expect.poll(visibleHeaders).toBe(0);
  const before = await sibling.boundingBox();

  await field.hover();
  await expect.poll(visibleHeaders).toBe(1);
  await expect(header).toContainText('customerName');
  await expect(header.locator('i')).toHaveText(['drag_indicator', 'text_fields', 'more_horiz']);
  expect(await sibling.boundingBox()).toEqual(before);

  await header.getByRole('button', { name: 'Options' }).click();
  await page.getByRole('menuitem', { name: 'Replace Field' }).hover();
  await expect(header).toHaveCSS('opacity', '1');
  await page.keyboard.press('Escape');
  await page.mouse.move(0, 0);
  await sibling.hover();
  await expect(sibling.locator('core-formly-field-header')).toHaveCSS('opacity', '1');
});

for (const action of ['Add Field', 'Replace Field']) {
  test(`${action} opens submenus on hover, including after reopening`, async ({ page }) => {
    const header = page.locator('core-formly-field-header').filter({ hasText: 'supportRequest' });

    for (let attempt = 0; attempt < 2; attempt++) {
      await page
        .getByLabel('Field supportRequest', { exact: true })
        .hover({ position: { x: 3, y: 3 } });
      await header.getByRole('button', { name: 'Options', exact: true }).click();
      await page.getByRole('menuitem', { name: action, exact: true }).hover();
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
  await page.getByRole('button', { name: 'Save Form', exact: true }).press('Tab');
  await expect(page.getByLabel('Field supportRequest', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  const options = header.getByRole('button', { name: 'Options' });
  await expect(options).toBeFocused();
  await options.press('Enter');
  await page.getByRole('menuitem', { name: 'Add Field', exact: true }).press('ArrowRight');
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
    const field = content.getByLabel('Field customerName', { exact: true });
    await expect(field.locator('core-formly-field-header')).toHaveCSS('opacity', '0');
    await field.tap();
    await expect(field.locator('core-formly-field-header')).toHaveCSS('opacity', '1');
    await field.getByRole('button', { name: 'Options' }).tap();
    await page.getByRole('menuitem', { name: 'Replace Field', exact: true }).tap();
    await page.getByRole('menuitem', { name: 'Form Controls', exact: true }).tap();
    await expect(page.getByRole('menuitem', { name: 'Textarea', exact: true })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Textarea', exact: true }).tap();
    await expect(content.locator('textarea')).toHaveCount(2);
  });
});
