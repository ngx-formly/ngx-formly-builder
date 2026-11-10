import { expect, test } from '@playwright/test';

for (const width of [1536, 1024, 390]) {
  test(`manages and copies workspace validations at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: width === 390 ? 'dark' : 'light' });
    await page.goto('/workspaces/validations');
    const catalog = page.locator('core-validations-tab-content:visible');
    const tabList = page.locator('core-forms-panel:visible .p-tablist-content');
    await expect
      .poll(() => tabList.evaluate((element) => element.scrollWidth <= element.clientWidth))
      .toBe(true);
    await expect(page.getByRole('tab', { name: 'Validations', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(catalog).toContainText('No validations yet');
    const create = catalog.getByRole('button', { name: 'Create validation', exact: true });
    await create.focus();
    await create.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Create validation', exact: true });
    await dialog.getByRole('textbox', { name: 'Rule name', exact: true }).fill('minimumAge');
    await dialog.getByRole('textbox', { name: 'Valid when', exact: true }).fill('control.value >=');
    await dialog
      .getByRole('textbox', { name: 'Error message', exact: true })
      .fill('Enter 18 or more.');
    await dialog.getByRole('button', { name: 'Save validation', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('not supported');
    await dialog
      .getByRole('textbox', { name: 'Valid when', exact: true })
      .fill('control.value >= 18');
    await page.screenshot({
      path: testInfo.outputPath(`validation-dialog-${width}.png`),
      animations: 'disabled',
    });
    const bounds = await dialog.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await dialog.getByRole('button', { name: 'Save validation', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(
      catalog.getByRole('button', { name: 'Edit validation minimumAge', exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(catalog).toContainText('minimumAge');
    await page.screenshot({
      path: testInfo.outputPath(`validation-catalog-${width}.png`),
      animations: 'disabled',
    });
    await page.getByRole('tab', { name: 'Forms', exact: true }).click();
    await expect(page).toHaveURL('/workspaces/forms');
    await page.goBack();
    await expect(page).toHaveURL('/workspaces/validations');
    await expect(catalog).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL('/workspaces/forms');

    await page.evaluate(() => {
      const form = {
        id: 'catalog-copy',
        name: 'Age form',
        libraryId: 'form-material',
        fields: [{ type: 'input', key: 'age', props: { label: 'Age', type: 'number' } }],
        model: {},
      };
      localStorage.setItem('formly-studio-forms-form-editor', JSON.stringify({ [form.id]: form }));
      localStorage.removeItem('formly-studio-hierarchy-form-editor');
    });
    await page.goto('/workspaces/forms/catalog-copy/fields');
    if (width < 1024) {
      await page.locator('.p-drawer-close-button').click();
      await expect(page.getByRole('complementary')).toBeHidden();
    }
    await page
      .locator('core-form-builder-content')
      .getByRole('spinbutton', { name: 'Age', exact: true })
      .click();
    await page
      .getByRole('main')
      .getByRole('button', { name: 'Open Validation panel', exact: true })
      .click();
    const custom = page
      .locator('core-validation-panel core-field-custom-validation-property')
      .first();
    await custom.getByRole('button', { name: 'Add custom validation', exact: true }).click();
    await page.getByRole('menuitem', { name: 'minimumAge', exact: true }).click();
    await expect(
      custom.getByRole('button', { name: 'Edit validation minimumAge', exact: true }),
    ).toBeVisible();
    if (width < 1024) {
      await page.locator('.p-drawer-close-button').click();
      await expect(page.getByRole('complementary')).toBeHidden();
    }
    await page.getByRole('button', { name: 'Save Form', exact: true }).click();
    await page
      .getByRole('main')
      .getByRole('button', { name: 'Open Workspace panel', exact: true })
      .click();
    await page.getByRole('tab', { name: 'Validations', exact: true }).click();
    await catalog.getByRole('button', { name: 'Edit validation minimumAge', exact: true }).click();
    const edit = page.getByRole('dialog', { name: 'Edit validation', exact: true });
    await edit
      .getByRole('textbox', { name: 'Valid when', exact: true })
      .fill('control.value >= 21');
    await edit.getByRole('button', { name: 'Save validation', exact: true }).click();
    await expect(edit).toBeHidden();
    page.once('dialog', (confirmation) => confirmation.accept());
    await catalog
      .getByRole('button', { name: 'Delete validation minimumAge', exact: true })
      .click();
    await expect(catalog).toContainText('No validations yet');
    await page.goto('/workspaces/forms/catalog-copy/fields');
    if (width < 1024) {
      await page.locator('.p-drawer-close-button').click();
      await expect(page.getByRole('complementary')).toBeHidden();
    }
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    const preview = page
      .locator('core-form-preview-content')
      .first()
      .frameLocator('iframe[title="Responsive form preview"]');
    const age = preview.getByRole('spinbutton', { name: 'Age', exact: true });
    await age.fill('17');
    await age.blur();
    await expect(preview.getByText('Enter 18 or more.', { exact: true })).toBeVisible();
    await age.fill('18');
    await age.blur();
    await expect(preview.getByText('Enter 18 or more.', { exact: true })).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });
}
