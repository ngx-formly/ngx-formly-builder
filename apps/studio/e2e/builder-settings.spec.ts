import { expect, test } from '@playwright/test';

for (const width of [1536, 1024, 390]) {
  test(`inspects settings without a form and restores navigation at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/workspaces/forms');
    await page
      .getByRole('main')
      .getByRole('button', { name: 'Open Builder settings panel', exact: true })
      .click();
    await expect(page).toHaveURL('/workspaces/settings');
    const panel = page.locator('core-settings-panel');
    await expect(
      panel.getByRole('heading', { name: 'Builder settings', exact: true }),
    ).toBeVisible();
    await expect(panel).toContainText('form-editor');
    await expect(panel).toContainText('3000 ms');
    await panel.getByRole('button', { name: 'Size', exact: true }).click();
    await expect(panel.getByText('48 · 12rem', { exact: false }).first()).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
    await page.screenshot({ path: testInfo.outputPath('settings.png'), fullPage: true });
    await page.goBack();
    await expect(page).toHaveURL('/workspaces/forms');
    await page.goForward();
    await expect(panel).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL('/workspaces/settings');
    await expect(panel).toBeVisible();
  });
}
