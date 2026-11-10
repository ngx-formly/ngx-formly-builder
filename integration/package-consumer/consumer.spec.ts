import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1536, height: 900 },
  { width: 1024, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`inspects host settings and stores custom styling values at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      localStorage.setItem(
        'formly-studio-forms-consumer-form-editor',
        JSON.stringify({
          sized: {
            id: 'sized',
            name: 'Sized form',
            libraryId: 'form-vanilla',
            fields: [{ key: 'name', type: 'input', props: { label: 'Name' } }],
            model: {},
          },
        }),
      );
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open Builder settings panel', exact: true }).click();
    const panel = page.locator('core-settings-panel');
    await expect(panel).toContainText('consumer-form-editor');
    await expect(panel).toContainText('500 ms');
    await expect(panel).toContainText('Consumer styles');
    await panel.getByRole('button', { name: 'Size', exact: true }).click();
    await expect(panel.getByText('Comfortable · 12rem', { exact: false })).toBeVisible();

    const navigation =
      viewport.width < 1024 ? page.getByRole('complementary') : page.locator('formly-builder');
    await navigation.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
    await page.getByRole('button', { name: 'Open form Sized form', exact: true }).click();
    await navigation.getByRole('button', { name: 'Open Styling panel', exact: true }).click();
    const width = page.getByRole('combobox', { name: 'Width', exact: true });
    await width.click();
    await page.getByRole('option', { name: 'Comfortable · 12rem', exact: true }).click();
    await expect(width).toHaveText('Comfortable · 12rem');
    await expect(page.locator('formly-field.w-48')).toHaveCSS('width', '192px');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const forms = JSON.parse(
            localStorage.getItem('formly-studio-forms-consumer-form-editor')!,
          );
          return forms.sized.fields[0].className;
        }),
      )
      .toBe('w-48');
  });

  test(`hides settings when disabled by the host at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?hide-settings');
    await expect(
      page.getByRole('button', { name: 'Open Workspace panel', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Open Builder settings panel', exact: true }),
    ).toHaveCount(0);
    if (viewport.width < 1024) {
      await page.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
      await expect(page.getByRole('complementary')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Open Builder settings panel', exact: true }),
      ).toHaveCount(0);
    }
    await expect(page.locator('core-settings-panel')).toHaveCount(0);
  });

  test(`renders the packaged editor at ${viewport.width}px`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto('/');

    const builder = page.locator('formly-builder');
    await expect(builder).toBeVisible();
    await expect(builder).toHaveCSS('--panel-header-height', '80px');
    await expect(page.locator('core-form-panel')).toHaveCSS('display', 'flex');
    await expect(page.locator('core-form-panel')).toHaveCSS('flex-direction', 'column');
    await expect(page.getByRole('button', { name: 'Create Form' }).first()).toHaveCSS(
      'align-items',
      'center',
    );
    await expect(page.getByRole('button', { name: 'Create Form' }).first()).not.toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );

    await page.getByRole('button', { name: 'Create Form' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Create Form' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Name', { exact: true }).fill('Packaged form');
    await dialog.getByRole('button', { name: 'Start with a blank form', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('core-form-panel')).toContainText('Packaged form');
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', viewport.width);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('consumer.png'), fullPage: true });
  });
}
