import { expect, test } from '@playwright/test';

for (const width of [1536, 375]) {
  test(`field palette shows descriptions and keeps add actions usable at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto('/form-editor');
    await page.getByRole('button', { name: 'Create Form', exact: true }).first().click();
    await page.getByRole('option', { name: 'Material', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Create Form' })
      .getByRole('button', { name: 'Start with a blank form', exact: true })
      .click();
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Open Add Field panel', exact: true }).first().click();
    if (width === 375) {
      await expect
        .poll(async () => (await page.getByRole('complementary').boundingBox())?.x)
        .toBe(0);
    }

    const panel = page.locator('core-add-field-panel');
    const divider = panel.locator('core-add-field-type-option').filter({
      has: page.getByText('Divider', { exact: true }),
    });
    await expect(
      divider.getByText('Horizontal or vertical divider', { exact: true }),
    ).toBeVisible();
    await expect(divider.locator('i')).toHaveText(['horizontal_rule', 'add']);
    expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath('field-palette.png') });

    await divider.hover();
    await expect(divider.locator('i')).toHaveText(['drag_indicator', 'add']);
    await page.mouse.move(0, 0);
    const add = divider.getByRole('button', { name: 'Add Field', exact: true });
    await add.focus();
    await expect(add.locator('..')).toHaveCSS('opacity', '1');
    await add.press('Enter');
    await page.getByRole('menuitem', { name: 'Add to form', exact: true }).click();
    await expect(page.locator('core-form-builder-content [aria-label^="Field "]')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Open Add Field panel', exact: true }).first().click();
    await panel.getByRole('tab', { name: 'Preset' }).click();
    const email = panel.locator('core-add-field-type-preset').filter({
      has: page.getByText('Email', { exact: true }),
    });
    await expect(email.getByText('Single-line text entry', { exact: true })).toBeVisible();
    expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath('preset-palette.png') });
  });
}
