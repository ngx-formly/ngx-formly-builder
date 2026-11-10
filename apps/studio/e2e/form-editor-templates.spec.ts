import { expect, test } from '@playwright/test';

for (const library of ['Vanilla', 'Material', 'Bootstrap', 'Ng Zorro']) {
  for (const template of ['Starter Form', 'Expense Report', 'Contact Us', 'Profile Update']) {
    test(`${template} works with ${library}`, async ({ page }, testInfo) => {
      const errors: Error[] = [];
      page.on('pageerror', (error) => errors.push(error));
      await page.goto('/form-editor');
      await page.getByRole('button', { name: 'Create Form' }).first().click();
      const dialog = page.getByRole('dialog', { name: 'Create Form' });
      if (library !== 'Vanilla') {
        await page.getByRole('option', { name: library, exact: true }).click();
      }
      await dialog
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(`${library} ${template}`);
      await dialog.getByRole('button', { name: template, exact: true }).click();
      await expect(dialog).toBeHidden();
      const content = page.locator('core-form-builder-content');
      await expect(content.locator('input').first()).toBeVisible();
      await expect(content).not.toContainText('Build Error:');

      await page.getByRole('button', { name: 'Preview', exact: true }).click();
      const preview = page
        .locator('core-form-preview-content')
        .first()
        .frameLocator('iframe[title="Responsive form preview"]');
      const label =
        template === 'Starter Form'
          ? /\bName\b/
          : template === 'Expense Report'
            ? /Report Title/
            : /First Name/;
      if (template === 'Contact Us' || template === 'Profile Update') {
        await expect(
          preview.getByRole('heading', {
            name: template === 'Contact Us' ? template : 'Update Profile',
          }),
        ).toBeVisible();
      }
      await preview.getByRole('textbox', { name: label }).fill('Updated shared example');
      if (template === 'Expense Report') {
        await expect(preview.locator('input[type="date"]').last()).toHaveValue('2026-09-18');
        await expect(preview.getByRole('spinbutton', { name: /Amount/ })).toHaveValue('420');
      } else if (template === 'Contact Us') {
        await preview.getByRole('button', { name: 'Send Message', exact: true }).click();
        await expect(preview.getByRole('status')).toContainText(
          'Please complete the required fields',
        );
        await preview.getByRole('textbox', { name: /Last Name/ }).fill('Lovelace');
        await preview.getByRole('textbox', { name: /\bEmail\b/ }).fill('ada@example.com');
        await preview
          .getByRole('textbox', { name: /Message/ })
          .fill('Hello from the contact example.');
        if (library === 'Vanilla' || library === 'Bootstrap') {
          await preview
            .getByRole('combobox', { name: /Subject/ })
            .selectOption({ label: 'General inquiry' });
        } else if (library === 'Ng Zorro') {
          await preview.locator('formly-field-nz-select').click();
          await preview
            .locator('nz-option-item')
            .getByText('General inquiry', { exact: true })
            .click();
        } else {
          await preview.getByRole('combobox', { name: /Subject/ }).click();
          await preview.getByRole('option', { name: 'General inquiry', exact: true }).click();
        }
        await preview.getByRole('button', { name: 'Send Message', exact: true }).click();
        await expect(preview.getByRole('status')).toHaveText('Demo complete. No data was sent.');
      } else if (template === 'Profile Update') {
        await preview.getByLabel('Profile Picture', { exact: true }).setInputFiles({
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=',
            'base64',
          ),
        });
        await expect(preview.getByText('Saved file: avatar.png', { exact: true })).toBeVisible();
        await preview.getByRole('button', { name: 'Update Profile', exact: true }).click();
        await expect(preview.getByRole('status').last()).toHaveText(
          'Demo complete. No data was sent.',
        );
      }
      await page.getByRole('button', { name: 'Save Form' }).click();
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem('formly-studio-forms-form-editor')))
        .toContain('Updated shared example');
      if (
        (template === 'Contact Us' || template === 'Profile Update') &&
        (library === 'Vanilla' || library === 'Material')
      ) {
        await page.setViewportSize({ width: 1440, height: 1200 });
        await preview
          .locator('formly-form > formly-field')
          .screenshot({ path: testInfo.outputPath('example-desktop.png') });
        await page.setViewportSize({ width: 390, height: 1300 });
        await expect(preview.getByRole('textbox', { name: /First Name/ })).toHaveValue(
          'Updated shared example',
        );
        await preview
          .locator('formly-form > formly-field')
          .screenshot({ path: testInfo.outputPath('example-mobile.png') });
        await page.setViewportSize({ width: 1280, height: 720 });
      }
      await page.reload();
      await page.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
      await page
        .getByRole('button', { name: `Open form ${library} ${template}`, exact: true })
        .click();
      await expect(content.getByRole('textbox', { name: label })).toHaveValue(
        'Updated shared example',
      );
      if (template === 'Profile Update') {
        await expect(content.getByText('Saved file: avatar.png', { exact: true })).toBeVisible();
        await expect(content.getByLabel('Profile Picture', { exact: true })).toHaveValue('');
      }
      expect(errors).toEqual([]);
    });
  }
}
