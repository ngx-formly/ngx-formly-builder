import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 1000, theme: 'light' as const },
  { width: 390, height: 844, theme: 'light' as const },
  { width: 1440, height: 1000, theme: 'dark' as const },
  { width: 390, height: 844, theme: 'dark' as const },
]) {
  test(`imports a dropped form in ${viewport.theme} mode at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: viewport.theme });
    await page.goto('/form-editor');
    await page.getByRole('button', { name: 'Create Form' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Create Form' });
    const card = dialog.getByRole('button', { name: 'Start with a blank form', exact: true });
    const fields = [{ key: 'name', type: 'input', props: { label: 'Imported name' } }];
    const dataTransfer = await page.evaluateHandle((fields) => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([JSON.stringify(fields)], 'Contact form.json', { type: 'application/json' }),
      );
      return transfer;
    }, fields);
    const initialBorder = await card.evaluate(
      (element) => getComputedStyle(element).borderTopColor,
    );
    await card.dispatchEvent('dragenter', { dataTransfer });
    await card.dispatchEvent('dragover', { dataTransfer });
    await expect(card.locator('i')).toHaveText('download');
    await expect(card).toHaveClass(/border-primary/);
    await expect(card).not.toHaveCSS('border-top-color', initialBorder);
    await expect(card).toHaveCSS('border-top-style', 'dashed');
    await page.screenshot({
      path: testInfo.outputPath('file-drag-over.png'),
      animations: 'disabled',
    });

    await card.dispatchEvent('dragleave', { dataTransfer });
    await expect(card.locator('i')).toHaveText('draft');
    await expect(card).toHaveCSS('border-top-color', initialBorder);
    await card.dispatchEvent('dragover', { dataTransfer });
    await card.dispatchEvent('drop', { dataTransfer });
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
    await expect(page.getByText('Build Error:', { exact: false })).toHaveCount(0);
    await dataTransfer.dispose();
  });
}
