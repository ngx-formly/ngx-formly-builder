import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`imports a form through the file picker at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/form-editor');
    await page.getByRole('button', { name: 'Create Form' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Create Form' });
    const button = dialog.getByRole('button', { name: 'Import form file', exact: true });
    const input = dialog.locator('input[type="file"]');
    await expect(button).toBeEnabled();
    await page.screenshot({
      path: testInfo.outputPath('create-form-import.png'),
      animations: 'disabled',
    });

    const cancelledChooser = page.waitForEvent('filechooser');
    await button.focus();
    await button.press('Enter');
    await (await cancelledChooser).setFiles([]);
    await expect(dialog).toBeVisible();

    const invalidChooser = page.waitForEvent('filechooser');
    await button.click();
    await (
      await invalidChooser
    ).setFiles({
      name: 'Contact form.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{'),
    });
    await expect(dialog).toContainText('Could not read the form. Use a valid JSON field array.');
    await expect(input).toHaveValue('');
    await expect(button).toBeEnabled();

    const fields = [{ key: 'name', type: 'input', props: { label: 'Imported name' } }];
    const chooser = page.waitForEvent('filechooser');
    await button.click();
    const fileChooser = await chooser;
    expect(fileChooser.isMultiple()).toBe(false);
    await fileChooser.setFiles({
      name: 'Contact form.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(fields)),
    });
    await expect(dialog).toBeHidden();
    await expect
      .poll(() =>
        page.evaluate(() =>
          Object.values(
            JSON.parse(localStorage.getItem('formly-studio-forms-form-editor') || '{}'),
          ),
        ),
      )
      .toEqual([
        expect.objectContaining({ name: 'Contact form', libraryId: 'form-vanilla', fields }),
      ]);
  });
}
