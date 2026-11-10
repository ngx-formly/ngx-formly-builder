import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`creates, edits, previews, and reloads a custom validation at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: width === 390 ? 'dark' : 'light' });
    await page.goto('/form-editor');
    await page.evaluate(() => {
      const form = {
        id: 'custom-validation-test',
        name: 'Age validation',
        libraryId: 'form-material',
        fields: [
          { type: 'input', key: 'age', props: { label: 'Age', type: 'number' } },
          { type: 'number', key: 'minimumAge', props: { label: 'Minimum age' } },
        ],
        model: { minimumAge: 18 },
      };
      localStorage.setItem('formly-studio-forms-form-editor', JSON.stringify({ [form.id]: form }));
    });
    await page.goto('/workspaces/forms/custom-validation-test/fields');
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
    const section = page
      .locator('core-validation-panel core-field-custom-validation-property')
      .first();
    const addValidation = section.getByRole('button', {
      name: 'Add custom validation',
      exact: true,
    });
    await addValidation.click({ trial: true });
    await addValidation.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'IP Address', exact: true })).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Create validation', exact: true }),
    ).toBeVisible();
    const pickerBounds = await page
      .getByRole('menu', { name: 'Add validation', exact: true })
      .boundingBox();
    expect(pickerBounds).not.toBeNull();
    expect(pickerBounds!.x).toBeGreaterThanOrEqual(0);
    expect(pickerBounds!.x + pickerBounds!.width).toBeLessThanOrEqual(width);
    await page.screenshot({
      path: testInfo.outputPath(`validation-picker-${width}.png`),
      animations: 'disabled',
    });
    await page.getByRole('menuitem', { name: 'IP Address', exact: true }).click();
    const registeredValidation = section.locator('core-custom-validation-item');
    await expect(registeredValidation).toContainText('IP Address');
    await expect(registeredValidation.getByRole('combobox')).toHaveCount(0);
    await expect(
      section.getByRole('button', { name: 'Create validation', exact: true }),
    ).toHaveCount(0);
    await addValidation.click();
    await expect(page.getByRole('menuitem', { name: 'IP Address', exact: true })).toHaveCount(0);
    await page.getByRole('menuitem', { name: 'Create validation', exact: true }).click();
    await expect(section.getByRole('textbox', { name: 'Rule name', exact: true })).toBeVisible();
    await section.getByRole('button', { name: 'Cancel', exact: true }).click();
    await registeredValidation
      .getByRole('button', { name: 'Remove validation', exact: true })
      .click();
    await addValidation.click();
    await expect(page.getByRole('menuitem', { name: 'IP Address', exact: true })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Create validation', exact: true }).click();
    await section.getByRole('textbox', { name: 'Rule name', exact: true }).fill('minimumAge');
    await section
      .getByRole('textbox', { name: 'Valid when', exact: true })
      .fill('control.value >=');
    await section
      .getByRole('textbox', { name: 'Error message', exact: true })
      .fill('Enter at least the minimum age.');
    await section.getByRole('button', { name: 'Save validation', exact: true }).click();
    await expect(section.getByRole('alert')).toContainText('not supported');
    await section
      .getByRole('textbox', { name: 'Valid when', exact: true })
      .fill('control.value >= model.minimumAge');
    await section.getByRole('button', { name: 'Save validation', exact: true }).click();
    await expect(
      section.getByRole('button', { name: 'Edit validation minimumAge', exact: true }),
    ).toBeVisible();
    await section.getByRole('button', { name: 'Edit validation minimumAge', exact: true }).click();
    await expect(section.getByRole('textbox', { name: 'Valid when', exact: true })).toHaveValue(
      'control.value >= model.minimumAge',
    );
    await page.screenshot({
      path: testInfo.outputPath(`validation-editor-${width}.png`),
      animations: 'disabled',
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await section.getByRole('button', { name: 'Save validation', exact: true }).click();
    if (width < 1024) {
      await page.locator('.p-drawer-close-button').click();
      await expect(page.getByRole('complementary')).toBeHidden();
    }
    await page.getByRole('button', { name: 'Save Form', exact: true }).click();
    await page.reload();
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
    await expect(
      preview.getByText('Enter at least the minimum age.', { exact: true }),
    ).toBeVisible();
    await age.fill('18');
    await age.blur();
    await expect(
      preview.getByText('Enter at least the minimum age.', { exact: true }),
    ).toBeHidden();
    await preview.getByRole('spinbutton', { name: 'Minimum age', exact: true }).fill('21');
    await expect(
      preview.getByText('Enter at least the minimum age.', { exact: true }),
    ).toBeVisible();
    await preview.getByRole('spinbutton', { name: 'Minimum age', exact: true }).fill('16');
    await expect(
      preview.getByText('Enter at least the minimum age.', { exact: true }),
    ).toBeHidden();
    await page.getByRole('button', { name: 'Builder', exact: true }).click();
    await page
      .locator('core-form-builder-content')
      .getByRole('spinbutton', { name: 'Age', exact: true })
      .click();
    await page
      .getByRole('main')
      .getByRole('button', { name: 'Open Validation panel', exact: true })
      .click();
    if (
      !(await section
        .getByRole('button', { name: 'Remove validation minimumAge', exact: true })
        .isVisible())
    ) {
      await section.locator('.p-panel-header').first().click();
    }
    await section
      .getByRole('button', { name: 'Remove validation minimumAge', exact: true })
      .click();
    await expect(
      section.getByRole('button', { name: 'Edit validation minimumAge', exact: true }),
    ).toHaveCount(0);
  });
}
