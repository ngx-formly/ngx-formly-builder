import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const key = 'formly-studio-forms-form-editor';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(
        key,
        JSON.stringify({
          first: {
            id: 'first',
            name: 'First form',
            libraryId: 'form-vanilla',
            fields: [{ key: 'name', type: 'input', props: { label: 'Name' } }],
            model: { name: 'Saved value' },
          },
          second: {
            id: 'second',
            name: 'Second form',
            libraryId: 'form-vanilla',
            fields: [],
            model: {},
          },
        }),
      );
    }
  });
});

for (const width of [1536, 1024, 390]) {
  test(`navigates workspace panels and tabs with history at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/workspaces/forms');
    if (width < 1024) {
      await page
        .getByRole('main')
        .getByRole('button', { name: 'Open Workspace panel', exact: true })
        .click();
    }
    const navigation = width < 1024 ? page.getByRole('complementary') : page.getByRole('main');
    await page.getByRole('button', { name: 'Open form First form', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();

    await navigation.getByRole('button', { name: 'Open Add Field panel', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/field$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/field$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();

    const fieldTab = page.getByRole('tab', { name: 'Field' });
    const presetTab = page.getByRole('tab', { name: 'Preset' });
    await presetTab.click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/preset$/);
    await expect(presetTab).toHaveAttribute('aria-selected', 'true');

    await page.goBack();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/field$/);
    await expect(fieldTab).toHaveAttribute('aria-selected', 'true');
    await page.goForward();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/preset$/);
    await expect(presetTab).toHaveAttribute('aria-selected', 'true');

    await page.reload();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/preset$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();
    await expect(presetTab).toHaveAttribute('aria-selected', 'true');
    await expect(
      page.locator('core-form-builder-content').getByRole('textbox', { name: 'Name', exact: true }),
    ).toHaveValue('Saved value');

    await fieldTab.click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/field$/);
    await expect(fieldTab).toHaveAttribute('aria-selected', 'true');

    await navigation.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/forms$/);
    await page.getByRole('button', { name: 'Open form First form', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();
  });

  test(`syncs right panel query parameters with history at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/workspaces/forms/first/preset');
    const navigation = width < 1024 ? page.getByRole('complementary') : page.getByRole('main');

    for (const [label, field, selector] of [
      ['Field Edit', 'edit', 'core-field-edit-panel'],
      ['Validation', 'validation', 'core-validation-panel'],
      ['Styling', 'styling', 'core-styling-panel'],
      ['Model', 'model', 'core-model-edit-panel'],
    ]) {
      await navigation.getByRole('button', { name: `Open ${label} panel`, exact: true }).click();
      await expect(page).toHaveURL(`/workspaces/forms/first/preset?field=${field}`);
      await expect(page.locator(selector)).toBeVisible();
    }

    await page.goBack();
    await expect(page).toHaveURL('/workspaces/forms/first/preset?field=styling');
    await expect(page.locator('core-styling-panel')).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL('/workspaces/forms/first/preset?field=model');
    await expect(page.locator('core-model-edit-panel')).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL('/workspaces/forms/first/preset?field=model');
    await expect(page.locator('core-model-edit-panel')).toBeVisible();

    await navigation.getByRole('button', { name: 'Open Add Field panel', exact: true }).click();
    await expect(page).toHaveURL('/workspaces/forms/first/preset?field=model');
    await expect(page.getByRole('tab', { name: 'Preset' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page.getByRole('tab', { name: 'Field' }).click();
    await expect(page).toHaveURL('/workspaces/forms/first/field?field=model');
    await expect(page.locator('core-add-field-panel')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL('/workspaces/forms/first/preset?field=model');
    await expect(page.locator('core-model-edit-panel')).toBeVisible();

    await page.goto('/workspaces/forms/second/fields?field=validation');
    await expect(page).toHaveURL('/workspaces/forms/second/fields?field=validation');
    await expect(page.locator('core-validation-panel')).toBeVisible();

    await navigation.getByRole('button', { name: 'Open Add Field panel', exact: true }).click();
    await expect(page).toHaveURL('/workspaces/forms/second/field?field=validation');
    await expect(page.locator('core-add-field-panel')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL('/workspaces/forms/second/fields?field=validation');
    await expect(page.locator('core-validation-panel')).toBeVisible();
  });
}

test('opens direct Fields links and restores the previous form through history', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto('/workspaces/forms/first/fields');
  await expect(page.locator('core-fields-panel')).toBeVisible();
  await page.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
  await page.getByRole('button', { name: 'Open form Second form', exact: true }).click();
  await expect(page).toHaveURL(/\/workspaces\/forms\/second\/fields$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/workspaces\/forms$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/workspaces\/forms\/first\/fields$/);
  await expect(
    page.locator('core-form-builder-content').getByRole('textbox', { name: 'Name', exact: true }),
  ).toHaveValue('Saved value');
});

test('redirects old editor links and missing forms to Workspace', async ({ page }) => {
  await page.goto('/form-editor');
  await expect(page).toHaveURL(/\/workspaces\/forms$/);
  await page.goto('/workspaces/forms/missing/fields');
  await expect(page).toHaveURL(/\/workspaces\/forms$/);
  await expect(page.getByRole('alert')).toContainText('This form could not be found.');
  await expect(page.locator('core-forms-panel')).toBeVisible();
});
