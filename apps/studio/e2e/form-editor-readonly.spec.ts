import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const form = {
      id: 'readonly-test',
      name: 'Readonly fields',
      libraryId: 'form-material',
      fields: [
        {
          type: 'formly-group',
          fieldGroup: [
            { type: 'input', key: 'reference', props: { label: 'Reference', readonly: true } },
            { type: 'input', key: 'name', props: { label: 'Name' } },
            { type: 'input', key: 'disabled', props: { label: 'Disabled', disabled: true } },
            {
              type: 'textarea',
              key: 'notes',
              props: { label: 'Notes', readonly: true, rows: 2 },
              expressions: { 'props.readonly': "model.name !== 'Unlock notes'" },
            },
          ],
        },
      ],
      model: { reference: 'SUP-1042', name: 'Jane Smith', notes: 'Submitted by support.' },
    };
    localStorage.setItem('formly-studio-forms-form-editor', JSON.stringify({ [form.id]: form }));
  });
});

for (const width of [1440, 390]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`dims readonly fields in builder and previews at ${width}px in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/workspaces/forms/readonly-test/fields');
      if (width < 1024) {
        await page.locator('.p-drawer-close-button').click();
        await expect(page.getByRole('complementary')).toBeHidden();
      }
      const builder = page.locator('core-form-builder-content');
      const dimmedFields = builder.locator('core-readonly-wrapper.opacity-50');
      await expect(dimmedFields).toHaveCount(2);
      await expect(dimmedFields.first()).toHaveCSS('opacity', '0.5');
      await expect(builder.getByText('Read only')).toHaveCount(0);
      await expect(builder.locator('core-formly-field-header').first()).toHaveCSS('opacity', '1');
      const reference = builder.getByRole('textbox', { name: 'Reference', exact: true });
      await expect(reference).not.toBeEditable();
      await expect(reference).toBeEnabled();
      await expect(builder.getByRole('textbox', { name: 'Name', exact: true })).toBeEditable();
      await expect(builder.getByRole('textbox', { name: 'Disabled', exact: true })).toBeDisabled();
      await page.screenshot({ path: testInfo.outputPath('builder.png'), animations: 'disabled' });

      for (const mode of ['inline', 'dialog']) {
        await page
          .getByRole('button', {
            name: mode === 'inline' ? 'Preview' : 'Open preview',
            exact: true,
          })
          .click();
        const preview =
          mode === 'dialog'
            ? page.getByRole('dialog', { name: 'Form Preview' })
            : page.locator('core-form-preview-content').first();
        const frame = preview.frameLocator('iframe[title="Responsive form preview"]');
        const dimmedPreviewFields = frame.locator('core-readonly-wrapper.opacity-50');
        await expect(dimmedPreviewFields).toHaveCount(2);
        await expect(dimmedPreviewFields.first()).toBeVisible();
        await expect(dimmedPreviewFields.first()).toHaveCSS('opacity', '0.5');
        await expect(dimmedPreviewFields.first()).toHaveCSS('display', 'block');
        await expect(frame.getByText('Read only')).toHaveCount(0);
        const previewReference = frame.getByRole('textbox', { name: 'Reference', exact: true });
        await expect(previewReference).not.toBeEditable();
        await expect(previewReference).toBeEnabled();
        await previewReference.focus();
        await previewReference.press('End');
        await previewReference.press('X');
        await expect(previewReference).toHaveValue('SUP-1042');
        await expect(previewReference).toBeFocused();
        await frame.getByRole('textbox', { name: 'Name', exact: true }).fill('Updated name');
        await expect(frame.getByRole('textbox', { name: 'Notes', exact: true })).not.toBeEditable();
        await page.screenshot({
          path: testInfo.outputPath(`${mode}-preview.png`),
          animations: 'disabled',
        });
        await frame.getByRole('textbox', { name: 'Name', exact: true }).fill('Unlock notes');
        await expect(dimmedPreviewFields).toHaveCount(1);
        await expect(frame.getByRole('textbox', { name: 'Notes', exact: true })).toBeEditable();
        await frame.getByRole('textbox', { name: 'Name', exact: true }).fill('Jane Smith');
        await expect(dimmedPreviewFields).toHaveCount(2);
        if (mode === 'inline') {
          await page.getByRole('button', { name: 'Builder', exact: true }).click();
        }
      }
    });
  }
}

test('updates readonly opacity when the property is toggled', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/workspaces/forms/readonly-test/fields');
  const builder = page.locator('core-form-builder-content');
  await builder.getByRole('textbox', { name: 'Reference', exact: true }).click();
  await page.getByRole('button', { name: 'Open Field Edit panel', exact: true }).click();
  const toggle = page
    .locator('core-field-boolean-property')
    .filter({ hasText: 'Readonly' })
    .getByRole('switch');

  await toggle.uncheck();
  await expect(builder.locator('core-readonly-wrapper.opacity-50')).toHaveCount(1);
  await expect(builder.getByRole('textbox', { name: 'Reference', exact: true })).toBeEditable();
  await toggle.check();
  await expect(builder.locator('core-readonly-wrapper.opacity-50')).toHaveCount(2);
  await expect(builder.getByRole('textbox', { name: 'Reference', exact: true })).not.toBeEditable();
  await page.getByRole('button', { name: 'Save Form', exact: true }).click();
  const saved = await page.evaluate(() => localStorage.getItem('formly-studio-forms-form-editor'));
  expect(saved).not.toContain('core-readonly');
});
