import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 1000, theme: 'light' as const },
  { width: 390, height: 844, theme: 'light' as const },
  { width: 1440, height: 1000, theme: 'dark' as const },
  { width: 390, height: 844, theme: 'dark' as const },
]) {
  test(`creates a Quick Start example directly in ${viewport.theme} mode at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: viewport.theme });
    await page.goto('/form-editor');
    await page.getByRole('button', { name: 'Create Form' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Create Form' });
    const library = dialog.getByRole('combobox', { name: 'UI Library', exact: true });
    const name = dialog.getByRole('textbox', { name: 'Name', exact: true });
    await expect(name).toBeVisible();
    await name.fill('Quick start test');
    await expect(dialog.getByRole('heading', { name: 'Quick Start' })).toBeVisible();
    const blankCard = await dialog.locator('#template-blank').boundingBox();
    const quickStart = await dialog.getByRole('region', { name: 'Quick Start' }).boundingBox();
    if (viewport.width >= 640) {
      expect(blankCard!.x + blankCard!.width).toBeLessThan(quickStart!.x);
    } else {
      expect(blankCard!.y + blankCard!.height).toBeLessThan(quickStart!.y);
    }
    const blank = dialog.getByRole('button', { name: 'Start with a blank form', exact: true });
    const importFile = dialog.getByRole('button', { name: 'Import form file', exact: true });
    const starter = dialog.getByRole('button', { name: 'Starter Form', exact: true });
    const expense = dialog.getByRole('button', { name: 'Expense Report', exact: true });
    await blank.focus();
    await blank.press('Tab');
    await expect(importFile).toBeFocused();
    await importFile.press('Tab');
    await expect(starter).toBeFocused();
    await starter.press('Tab');
    await expect(expense).toBeFocused();
    await expense.press('Shift+Tab');
    await expect(starter).toBeFocused();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create Form' })).toHaveCount(0);
    await expect(
      dialog.getByRole('group', { name: 'Starting point' }).getByRole('button'),
    ).toHaveCount(6);
    await expect(dialog.getByRole('button', { name: /Showcase|Basics/ })).toHaveCount(0);

    await library.click();
    await page.getByRole('option', { name: 'Material', exact: true }).click();
    await expect(page.getByRole('listbox')).toBeHidden();
    await library.click();
    await expect(page.getByRole('option', { name: 'Studio Material', exact: true })).toHaveCount(0);
    await expect(page.getByRole('option', { name: 'Material', exact: true })).toHaveCount(1);
    await page.getByRole('option', { name: 'Ng Zorro', exact: true }).click();
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(name).toHaveValue('Quick start test');
    await page.screenshot({
      path: testInfo.outputPath('direct-create.png'),
      animations: 'disabled',
    });

    await starter.focus();
    await starter.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Builder', exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          Object.values(
            JSON.parse(localStorage.getItem('formly-studio-forms-form-editor') || '{}'),
          ),
        ),
      )
      .toEqual([expect.objectContaining({ name: 'Quick start test', libraryId: 'form-ng-zorro' })]);
  });
}

test('creates, edits, previews, and reopens a form without a UI library', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/form-editor');
  await page.getByRole('button', { name: 'Create Form' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Create Form' });
  await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Vanilla form');
  await expect(dialog.getByText('Leave empty for Vanilla (native HTML controls).')).toBeVisible();
  await expect(dialog.getByRole('combobox', { name: 'UI Library', exact: true })).toHaveAttribute(
    'aria-describedby',
    'create-form-library-help',
  );
  await expect(
    dialog.getByRole('button', { name: 'Start with a blank form', exact: true }),
  ).toBeEnabled();
  await dialog.getByRole('button', { name: 'Start with a blank form', exact: true }).click();

  await page.getByRole('button', { name: 'Open Add Field panel' }).first().click();
  const inputSource = page.locator('core-type-container').filter({ hasText: 'Input' }).first();
  await inputSource.hover();
  await inputSource.getByRole('button', { name: 'Add Field' }).click();
  await page.getByRole('menuitem', { name: 'Add to form', exact: true }).click();
  await expect(
    page.locator('core-form-builder-content').getByRole('textbox', { name: 'Input', exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.locator('core-form-preview-content').first();
  const frame = preview.frameLocator('iframe[title="Responsive form preview"]');
  await frame.getByRole('textbox', { name: 'Input', exact: true }).fill('Vanilla value');
  await page.getByRole('button', { name: 'Save Form' }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('formly-studio-forms-form-editor')))
    .toContain('Vanilla value');
  await page.reload();
  await page.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
  await page.getByRole('button', { name: 'Open form Vanilla form', exact: true }).click();
  await expect(
    page.locator('core-form-builder-content').getByRole('textbox', { name: 'Input', exact: true }),
  ).toHaveValue('Vanilla value');
  await expect(page.getByText('Build Error:', { exact: false })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('allows clearing a chosen library and leaving the form name blank', async ({ page }) => {
  await page.goto('/form-editor');
  await page.getByRole('button', { name: 'Create Form' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Create Form' });
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Material', exact: true }).click();
  await dialog.locator('[data-pc-section="clearicon"]').click();
  await expect(dialog.locator('[data-pc-section="clearicon"]')).toBeHidden();
  await dialog.getByRole('textbox', { name: 'Name', exact: true }).clear();
  await expect(
    dialog.getByRole('button', { name: 'Start with a blank form', exact: true }),
  ).toBeEnabled();
  await expect(dialog.getByRole('button', { name: 'Starter Form', exact: true })).toBeEnabled();
  await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('   ');
  await dialog.getByRole('combobox').focus();
  await expect(dialog.getByText('Name is required.')).toHaveCount(0);
  await expect(
    dialog.getByRole('button', { name: 'Start with a blank form', exact: true }),
  ).toBeEnabled();
  await dialog.getByRole('button', { name: 'Start with a blank form', exact: true }).press('Space');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Builder', exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('formly-studio-forms-form-editor')))
    .toContain('"name":"New form"');
});

for (const [startingPoint, savedName] of [
  ['Start with a blank form', 'New form'],
  ['Starter Form', 'Starter Form'],
  ['Expense Report', 'Expense Report'],
  ['Contact Us', 'Contact Us'],
  ['Profile Update', 'Profile Update'],
]) {
  test(`saves ${startingPoint} with its default name`, async ({ page }) => {
    await page.goto('/form-editor');
    await page.getByRole('button', { name: 'Create Form' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Create Form' });
    await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('');
    await dialog.getByRole('button', { name: startingPoint, exact: true }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await page.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
    await expect(
      page.getByRole('button', { name: `Open form ${savedName}`, exact: true }),
    ).toBeVisible();
  });
}
