import { expect, Locator, Page, test } from '@playwright/test';
import { loadMaterialFixture } from './helpers/material-fixture';

function field(page: Page, key: string) {
  return page
    .locator('core-field-wrapper')
    .filter({
      has: page.locator('core-formly-field-header > div > span').getByText(key, { exact: true }),
    })
    .last();
}

async function drop(source: Locator, target: Locator, side: 'left' | 'right' | 'top' | 'bottom') {
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  await source
    .locator('core-formly-field-header')
    .first()
    .dragTo(target, {
      sourcePosition: { x: 16, y: 10 },
      targetPosition: {
        x: side === 'left' ? 4 : side === 'right' ? box!.width - 4 : box!.width / 2,
        y: side === 'top' ? 4 : side === 'bottom' ? box!.height - 4 : box!.height / 2,
      },
    });
}

test('groups, reorders and extracts fields while preserving values and responsive preview', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1536, height: 1000 });
  await page.goto('/form-editor');
  await loadMaterialFixture(page);
  const name = field(page, 'customerName');
  const reference = field(page, 'reference');
  const number = field(page, 'accountNumber');
  const row = page.locator('core-form-builder-content .formly-builder-row');

  await drop(reference, name, 'right');
  await expect(row.locator(':scope > formly-field')).toHaveCount(2);
  await expect(name.locator('input')).toHaveValue('Jane Smith');
  await expect(reference.locator('input')).toHaveValue('SUP-1042');
  await drop(number, reference, 'left');
  await expect(row.locator(':scope > formly-field')).toHaveCount(3);
  const headers = row.locator('core-formly-field-header > div:first-child > span');
  await expect(headers).toHaveText(['customerName', 'accountNumber', 'reference']);
  const widths = await row
    .locator(':scope > formly-field')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  await page.screenshot({ path: testInfo.outputPath('three-column-row.png') });

  await drop(number, reference, 'bottom');
  await expect(row.locator(':scope > formly-field')).toHaveCount(2);
  expect((await number.boundingBox())!.y).toBeGreaterThan((await row.boundingBox())!.y);
  await drop(number, name, 'top');
  await expect
    .poll(async () => (await number.boundingBox())!.y - (await row.boundingBox())!.y)
    .toBeLessThan(0);

  await page.getByRole('button', { name: 'Save Form', exact: true }).click();
  await page.reload();
  await expect(row.locator(':scope > formly-field')).toHaveCount(2);
  await expect(name.locator('input')).toHaveValue('Jane Smith');

  await page.getByRole('button', { name: 'Export Form', exact: true }).click();
  const exported = page.getByRole('dialog', { name: 'Export Form' });
  await expect(exported).toContainText('formly-builder-row');
  await expect(exported).not.toContainText('"_info"');
  await page.keyboard.press('Escape');

  await name
    .locator('core-formly-field-header')
    .getByRole('button', { name: 'Options', exact: true })
    .click();
  const menu = page.getByRole('menu');
  await menu.press('Home');
  await menu.press('ArrowDown');
  await menu.press('Enter');
  await expect(row.locator(':scope > formly-field')).toHaveCount(1);
  await drop(name, reference, 'left');
  await expect(row.locator(':scope > formly-field')).toHaveCount(2);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(row).toHaveCSS('flex-direction', 'column');
  await page.screenshot({ path: testInfo.outputPath('stacked-row.png') });
  await page.getByRole('button', { name: 'Open preview', exact: true }).click();
  const preview = page
    .getByRole('dialog', { name: 'Form Preview' })
    .frameLocator('iframe[title="Responsive form preview"]');
  await expect(preview.locator('.formly-builder-row')).toHaveCSS('flex-direction', 'column');
  await expect(preview.getByRole('textbox', { name: 'Customer name', exact: true })).toHaveValue(
    'Jane Smith',
  );
});
