import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

for (const width of [1536, 1024, 390]) {
  test(`edits settings without a form and restores navigation at ${width}px`, async ({
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
    const autosave = panel.getByRole('checkbox', { name: 'Autosave', exact: true });
    await expect(autosave).not.toBeChecked();
    const delay = panel.getByRole('spinbutton', { name: 'Autosave delay (ms)' });
    await expect(delay).toHaveValue('3000');
    await panel.getByRole('button', { name: 'Size', exact: true }).click();
    await expect(panel.getByText('48 · 12rem', { exact: false }).first()).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', width);
    await page.screenshot({ path: testInfo.outputPath('settings.png'), fullPage: true });
    await autosave.check();
    await delay.fill('500');
    await panel.getByRole('button', { name: 'Save settings', exact: true }).click();
    await expect(panel.getByRole('status')).toHaveText('Settings updated.');
    await page.goBack();
    await expect(page).toHaveURL('/workspaces/forms');
    await page.goForward();
    await expect(panel).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL('/workspaces/settings');
    await expect(autosave).toBeChecked();
    await expect(delay).toHaveValue('500');
  });
}

test('saves, exports, resets and imports the autosave settings', async ({ page }) => {
  await page.goto('/workspaces/settings');
  const panel = page.locator('core-settings-panel');
  const autosave = panel.getByRole('checkbox', { name: 'Autosave', exact: true });
  const delay = panel.getByRole('spinbutton', { name: 'Autosave delay (ms)' });
  const status = panel.getByRole('status');
  await expect(delay).toHaveValue('3000');

  await autosave.check();
  await delay.fill('500');
  await panel.getByRole('button', { name: 'Save settings', exact: true }).click();
  await expect(status).toHaveText('Settings updated.');
  await page.reload();
  await expect(delay).toHaveValue('500');

  const downloadPromise = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Export settings', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('formly-builder-settings-form-editor.json');
  const exported = await readFile((await download.path())!);
  expect(JSON.parse(exported.toString())).toEqual({ autoSave: true, autoSaveDelay: 500 });

  await panel.getByRole('button', { name: 'Reset to host defaults', exact: true }).click();
  await expect(autosave).not.toBeChecked();
  await expect(delay).toHaveValue('3000');
  await page.reload();
  await expect(autosave).not.toBeChecked();
  await expect(delay).toHaveValue('3000');

  const chooserPromise = page.waitForEvent('filechooser');
  await panel.getByRole('button', { name: 'Import settings', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: download.suggestedFilename(),
    mimeType: 'application/json',
    buffer: exported,
  });
  await expect(autosave).toBeChecked();
  await expect(delay).toHaveValue('500');
  await page.reload();
  await expect(autosave).toBeChecked();
  await expect(delay).toHaveValue('500');
});
