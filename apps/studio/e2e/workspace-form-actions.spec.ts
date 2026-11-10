import { expect, test } from '@playwright/test';

for (const width of [1536, 390]) {
  test.describe(`Inline form actions at ${width}px`, () => {
    test.use({ hasTouch: width < 1024 });

    test('renames and deletes a form directly from its row', async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: width < 1024 ? 'dark' : 'light' });
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
                fields: [],
                model: {},
              },
            }),
          );
        }
      });
      await page.goto('/workspaces/forms');
      if (width < 1024) {
        await page
          .getByRole('main')
          .getByRole('button', { name: 'Open Workspace panel', exact: true })
          .click();
      }
      const panel = page.locator('core-forms-panel:visible');
      const row = panel.locator('core-tree-item').filter({ hasText: 'First form' });
      const editButton = row.getByRole('button', {
        name: 'Edit form name First form',
        exact: true,
      });
      const deleteButton = row.getByRole('button', { name: 'Delete form First form', exact: true });
      if (width >= 1024) await row.hover();
      await expect(editButton).toBeVisible();
      await expect(deleteButton).toBeVisible();
      await expect(row.getByRole('button', { name: 'Options', exact: true })).toHaveCount(0);
      await page.screenshot({
        path: testInfo.outputPath(`inline-form-actions-${width}.png`),
        animations: 'disabled',
      });

      await editButton.focus();
      await page.keyboard.press('Enter');
      const nameInput = page.getByRole('dialog').getByRole('textbox');
      await expect(nameInput).toHaveValue('First form');
      await expect(page).toHaveURL(/\/workspaces\/forms$/);
      await expect(
        row.getByRole('button', { name: 'Select form First form', exact: true }),
      ).toHaveAttribute('aria-pressed', 'false');
      await nameInput.fill('Renamed form');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(
        panel.getByRole('button', { name: 'Open form Renamed form', exact: true }),
      ).toBeVisible();
      await panel.getByRole('button', { name: 'Delete form Renamed form', exact: true }).click();
      await expect(panel.getByText('No Forms Yet', { exact: true })).toBeVisible();
      await expect(page).toHaveURL(/\/workspaces\/forms$/);
      await page.reload();
      await expect(
        page.getByRole('button', { name: 'Open form Renamed form', exact: true }),
      ).toHaveCount(0);
    });
  });
}
