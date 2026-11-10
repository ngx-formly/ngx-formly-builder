import { openWorkspaceTab } from './helpers/workspace-tab';
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
    const launchers = page.getByRole('main').locator('core-panel-option');
    await expect(launchers.getByRole('button', { name: 'Open Workspace panel' })).toBeEnabled();
    await expect(
      launchers.getByRole('button', { name: 'Open Fields panel', exact: true }),
    ).toBeDisabled();
    await expect(
      launchers.getByRole('button', { name: 'Open Add Field panel', exact: true }),
    ).toBeDisabled();
    await expect(launchers.getByRole('button', { disabled: true })).toHaveCount(6);

    if (width < 1024) {
      await page
        .getByRole('main')
        .getByRole('button', { name: 'Open Workspace panel', exact: true })
        .click();
    }
    const navigation = width < 1024 ? page.getByRole('complementary') : page.getByRole('main');
    await expect(navigation.getByRole('tab')).toHaveText([/Forms/, /Validations/]);
    await page.getByRole('button', { name: 'Open form First form', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();
    await expect(
      page.locator('core-fields-panel').getByRole('heading', { name: 'Fields', exact: true }),
    ).toBeVisible();
    await expect(navigation.getByRole('tablist')).toHaveCount(0);
    await expect(
      navigation.locator('core-panel-option').getByRole('button', { disabled: false }),
    ).toHaveCount(8);

    await navigation.getByRole('button', { name: 'Open Add Field panel', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/field$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();
    await expect(navigation.getByRole('tab')).toHaveText([/Field/, /Preset/]);
    await expect(page.getByRole('tab', { name: 'Field', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await navigation.getByRole('button', { name: 'Open Fields panel', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/fields$/);
    await expect(navigation.getByRole('tablist')).toHaveCount(0);
    const leftNavigation = navigation.locator('core-panel-option-list[position="left"]');
    await expect(leftNavigation.locator('.opacity-100')).toHaveCount(1);
    await expect(
      leftNavigation
        .locator('core-panel-option')
        .filter({ hasText: 'Fields' })
        .locator('.opacity-100'),
    ).toBeVisible();

    await openWorkspaceTab(page, 'Add Field');
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/field$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/workspaces\/forms\/first\/field$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();

    const fieldTab = page.getByRole('tab', { name: 'Field', exact: true });
    const presetTab = page.getByRole('tab', { name: 'Preset' });
    await fieldTab.focus();
    await fieldTab.press('ArrowRight');
    await expect(presetTab).toBeFocused();
    await presetTab.press('Enter');
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
    await page.getByRole('tab', { name: 'Field', exact: true }).click();
    await expect(page).toHaveURL('/workspaces/forms/first/field?field=model');
    await expect(page.locator('core-add-field-panel')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL('/workspaces/forms/first/preset?field=model');
    await expect(page.locator('core-model-edit-panel')).toBeVisible();

    await page.goto('/workspaces/forms/second/fields?field=validation');
    await expect(page).toHaveURL('/workspaces/forms/second/fields?field=validation');
    await expect(page.locator('core-validation-panel')).toBeVisible();

    await openWorkspaceTab(page, 'Add Field');
    await expect(page).toHaveURL('/workspaces/forms/second/field?field=validation');
    await expect(page.locator('core-add-field-panel')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL('/workspaces/forms/second/fields?field=validation');
    await expect(page.locator('core-validation-panel')).toBeVisible();
  });
}

test('restores the form view after reload and through browser history', async ({ page }) => {
  await page.goto('/workspaces/forms/first/fields');
  const toolbar = page.locator('core-form-toolbar');

  for (const [label, query] of [
    ['Preview', '?view=preview'],
    ['JSON', '?view=json'],
    ['Builder', ''],
  ]) {
    const button = toolbar.getByRole('button', { name: label, exact: true });
    await button.click();
    await expect(page).toHaveURL(`/workspaces/forms/first/fields${query}`);
    await page.reload();
    await expect(page).toHaveURL(`/workspaces/forms/first/fields${query}`);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }

  await page.goBack();
  await expect(page).toHaveURL('/workspaces/forms/first/fields?view=json');
  await expect(toolbar.getByRole('button', { name: 'JSON', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('core-json-content .cm-content')).toContainText('"key": "name"');
  await page.goForward();
  await expect(page).toHaveURL('/workspaces/forms/first/fields');
  await expect(toolbar.getByRole('button', { name: 'Builder', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.locator('core-form-builder-content').getByRole('textbox', { name: 'Name', exact: true }),
  ).toHaveValue('Saved value');
});

test('opens direct Fields links and restores the previous form through history', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto('/workspaces/forms/first/fields');
  await expect(page.locator('core-fields-panel')).toBeVisible();
  await openWorkspaceTab(page, 'Forms');
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
