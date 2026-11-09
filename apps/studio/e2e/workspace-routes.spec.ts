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
  test(`navigates Workspace, Fields and Add Field with history at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/workspaces');
    if (width < 1024) {
      await page
        .getByRole('main')
        .getByRole('button', { name: 'Open Workspace panel', exact: true })
        .click();
    }
    const navigation = width < 1024 ? page.getByRole('complementary') : page.getByRole('main');
    await page.getByRole('button', { name: 'Open form First form', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();

    await navigation.getByRole('button', { name: 'Open Add Field panel', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/first\/field$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/workspaces\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/workspaces\/first\/field$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/workspaces\/first\/field$/);
    await expect(page.locator('core-add-field-panel')).toBeVisible();
    await expect(
      page.locator('core-form-builder-content').getByRole('textbox', { name: 'Name', exact: true }),
    ).toHaveValue('Saved value');

    await navigation.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces$/);
    await page.getByRole('button', { name: 'Open form First form', exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/first\/fields$/);
    await expect(page.locator('core-fields-panel')).toBeVisible();
  });
}

test('opens direct Fields links and restores the previous form through history', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto('/workspaces/first/fields');
  await expect(page.locator('core-fields-panel')).toBeVisible();
  await page.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
  await page.getByRole('button', { name: 'Open form Second form', exact: true }).click();
  await expect(page).toHaveURL(/\/workspaces\/second\/fields$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/workspaces$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/workspaces\/first\/fields$/);
  await expect(
    page.locator('core-form-builder-content').getByRole('textbox', { name: 'Name', exact: true }),
  ).toHaveValue('Saved value');
});

test('redirects old editor links and missing forms to Workspace', async ({ page }) => {
  await page.goto('/form-editor');
  await expect(page).toHaveURL(/\/workspaces$/);
  await page.goto('/workspaces/missing/fields');
  await expect(page).toHaveURL(/\/workspaces$/);
  await expect(page.getByRole('alert')).toContainText('This form could not be found.');
  await expect(page.locator('core-forms-panel')).toBeVisible();
});
