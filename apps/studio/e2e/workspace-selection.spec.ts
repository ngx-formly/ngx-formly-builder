import { expect, test } from '@playwright/test';

for (const width of [1536, 390]) {
  test.describe(`Workspace selection at ${width}px`, () => {
    test.use({ hasTouch: width < 1024 });
    test(`selects and deletes workspace items at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => {
        const key = 'formly-studio-forms-form-editor';
        if (!localStorage.getItem(key)) {
          localStorage.setItem(
            key,
            JSON.stringify(
              Object.fromEntries(
                ['First', 'Second', 'Keep'].map((name) => [
                  name.toLowerCase(),
                  {
                    id: name.toLowerCase(),
                    name: `${name} form`,
                    libraryId: 'form-vanilla',
                    fields: [],
                    model: {},
                  },
                ]),
              ),
            ),
          );
        }
      });
      await page.goto('/workspaces/forms/first/fields');
      const navigation =
        width < 1024 ? page.getByRole('complementary') : page.locator('core-lhs-sidebar');
      await navigation.getByRole('button', { name: 'Open Workspace panel', exact: true }).click();
      const panel = page.locator('core-forms-panel:visible');
      const first = panel.getByRole('button', { name: 'Select form First form', exact: true });
      const second = panel.getByRole('button', { name: 'Select form Second form', exact: true });
      const firstRow = panel.locator('core-tree-item').filter({
        has: page.getByRole('button', { name: 'Select form First form', exact: true }),
      });
      const icon = firstRow.locator('[itemIcon]');
      const deleteButton = panel.getByRole('button', { name: /^Delete selected items/ });
      await expect(deleteButton).toHaveCount(0);
      await page.mouse.move(0, 0);
      await expect(first).toHaveCSS('opacity', width < 1024 ? '1' : '0');
      await expect(icon).toHaveCSS('visibility', width < 1024 ? 'hidden' : 'visible');
      await page.screenshot({
        path: testInfo.outputPath(`workspace-icons-${width}.png`),
        animations: 'disabled',
      });
      const iconBounds = (await icon.boundingBox())!;
      await panel.getByRole('button', { name: 'Open form First form', exact: true }).hover();
      await expect(first).toHaveCSS('opacity', '1');
      await expect(icon).toHaveCSS('visibility', 'hidden');
      const checkboxBounds = (await first.locator('i').boundingBox())!;
      expect(iconBounds.x).toBeCloseTo(checkboxBounds.x, 0);
      expect(iconBounds.y).toBeCloseTo(checkboxBounds.y, 0);
      await page.mouse.move(0, 0);
      await expect(first).toHaveCSS('opacity', width < 1024 ? '1' : '0');
      await expect(icon).toHaveCSS('visibility', width < 1024 ? 'hidden' : 'visible');
      const selectionBounds = (await first.boundingBox())!;
      const rowBounds = (await panel
        .locator('core-tree-item')
        .filter({ has: page.getByRole('button', { name: 'Select form First form', exact: true }) })
        .boundingBox())!;
      expect(selectionBounds.x).toBeCloseTo(rowBounds.x, 0);
      expect(selectionBounds.y).toBeCloseTo(rowBounds.y, 0);
      expect(selectionBounds.height).toBeCloseTo(rowBounds.height, 0);
      await first.click({ position: { x: 4, y: 4 } });
      await expect(first).toHaveAttribute('aria-pressed', 'true');
      await expect(icon).toHaveCSS('visibility', 'hidden');
      await first.click({
        position: { x: selectionBounds.width - 4, y: selectionBounds.height - 4 },
      });
      await expect(first).toHaveAttribute('aria-pressed', 'false');
      await first.click({ position: { x: selectionBounds.width - 4, y: 4 } });
      await page.mouse.move(0, 0);
      await expect(first).toHaveCSS('opacity', '1');
      await expect(first).toHaveAttribute('aria-pressed', 'true');
      await expect(page).toHaveURL(/\/workspaces\/forms$/);

      await second.focus();
      await expect(second).toHaveCSS('opacity', '1');
      await expect(
        panel
          .locator('core-tree-item')
          .filter({
            has: page.getByRole('button', { name: 'Select form Second form', exact: true }),
          })
          .locator('[itemIcon]'),
      ).toHaveCSS('visibility', 'hidden');
      await page.keyboard.press('Space');
      await expect(deleteButton).toHaveAccessibleName('Delete selected items (2)');
      await expect(deleteButton.locator('[pButtonLabel]')).toHaveText('2');
      const deleteBounds = (await deleteButton.boundingBox())!;
      const createBounds = (await panel
        .getByRole('button', { name: 'Create Form', exact: true })
        .boundingBox())!;
      const filterBounds = (await panel.locator('core-filter').boundingBox())!;
      expect(deleteBounds.y).toBeCloseTo(createBounds.y, 0);
      expect(deleteBounds.x + deleteBounds.width).toBeCloseTo(
        filterBounds.x + filterBounds.width,
        0,
      );
      await page.screenshot({ path: testInfo.outputPath(`workspace-selection-${width}.png`) });

      await panel.getByPlaceholder('Filter items...').fill('Keep');
      await deleteButton.click();
      await expect(deleteButton).toHaveCount(0);
      await panel.getByPlaceholder('Filter items...').fill('');
      await expect(
        panel.getByRole('button', { name: 'Open form First form', exact: true }),
      ).toHaveCount(0);
      await expect(
        panel.getByRole('button', { name: 'Open form Second form', exact: true }),
      ).toHaveCount(0);
      await expect(
        panel.getByRole('button', { name: 'Open form Keep form', exact: true }),
      ).toBeVisible();
      await expect(page.locator('core-form-builder-content')).toHaveCount(0);

      await page.reload();
      if (width < 1024) {
        await page
          .getByRole('main')
          .getByRole('button', { name: 'Open Workspace panel', exact: true })
          .click();
      }
      await expect(
        panel.getByRole('button', { name: 'Open form Keep form', exact: true }),
      ).toBeVisible();
      await expect(
        panel.getByRole('button', { name: 'Open form First form', exact: true }),
      ).toHaveCount(0);
      await panel.getByRole('button', { name: 'New folder', exact: true }).click();
      await panel.getByRole('button', { name: 'Select folder New Folder', exact: true }).click();
      await panel.getByRole('button', { name: 'Select form Keep form', exact: true }).click();
      await deleteButton.click();
      await expect(panel.getByText('No Forms Yet', { exact: true })).toBeVisible();
    });

    test(`selects and deletes validation rows at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: width < 1024 ? 'dark' : 'light' });
      await page.addInitScript(() => {
        const key = 'formly-studio-validations-form-editor';
        if (!localStorage.getItem(key)) {
          localStorage.setItem(
            key,
            JSON.stringify(
              ['First', 'Second', 'Keep'].map((name) => ({
                id: name.toLowerCase(),
                name,
                expression: 'control.value >= 18',
                message: 'Enter 18 or more.',
              })),
            ),
          );
        }
      });
      await page.goto('/workspaces/validations');
      const panel = page.locator('core-validations-tab-content:visible');
      const first = panel.getByRole('button', { name: 'Select validation First', exact: true });
      const second = panel.getByRole('button', { name: 'Select validation Second', exact: true });
      const firstRow = panel.locator('core-tree-item').filter({
        has: page.getByRole('button', { name: 'Select validation First', exact: true }),
      });
      const icon = firstRow.locator('[itemIcon]');
      const deleteButton = panel.getByRole('button', { name: /^Delete selected validations/ });
      await page.mouse.move(0, 0);
      await expect(first).toHaveCSS('opacity', width < 1024 ? '1' : '0');
      await expect(icon).toHaveCSS('visibility', width < 1024 ? 'hidden' : 'visible');
      await page.screenshot({
        path: testInfo.outputPath(`validation-icons-${width}.png`),
        animations: 'disabled',
      });
      const iconBounds = (await icon.boundingBox())!;
      await firstRow.hover();
      await expect(first).toHaveCSS('opacity', '1');
      await expect(icon).toHaveCSS('visibility', 'hidden');
      const checkboxBounds = (await first.locator('i').boundingBox())!;
      expect(iconBounds.x).toBeCloseTo(checkboxBounds.x, 0);
      expect(iconBounds.y).toBeCloseTo(checkboxBounds.y, 0);
      await page.mouse.move(0, 0);
      await expect(first).toHaveCSS('opacity', width < 1024 ? '1' : '0');
      await expect(icon).toHaveCSS('visibility', width < 1024 ? 'hidden' : 'visible');
      await first.click();
      await page.mouse.move(0, 0);
      await second.focus();
      await expect(first).toHaveCSS('opacity', '1');
      await expect(icon).toHaveCSS('visibility', 'hidden');
      await expect(second).toHaveCSS('opacity', '1');
      await page.keyboard.press('Space');
      await expect(deleteButton).toHaveAccessibleName('Delete selected validations (2)');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath(`validation-selection-${width}.png`) });
      await panel.getByPlaceholder('Filter items...').fill('Keep');
      page.once('dialog', (dialog) => dialog.dismiss());
      await deleteButton.click();
      await expect(deleteButton).toHaveAccessibleName('Delete selected validations (2)');
      page.once('dialog', (dialog) => dialog.accept());
      await deleteButton.click();
      await expect(deleteButton).toHaveCount(0);
      await panel.getByPlaceholder('Filter items...').fill('');
      await expect(
        panel.getByRole('button', { name: 'Edit validation First', exact: true }),
      ).toHaveCount(0);
      await expect(
        panel.getByRole('button', { name: 'Edit validation Keep', exact: true }),
      ).toBeVisible();
      await page.reload();
      await expect(
        panel.getByRole('button', { name: 'Edit validation First', exact: true }),
      ).toHaveCount(0);
      await expect(
        panel.getByRole('button', { name: 'Edit validation Keep', exact: true }),
      ).toBeVisible();
    });
  });
}
