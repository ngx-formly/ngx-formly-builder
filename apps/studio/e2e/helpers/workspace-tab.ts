import { expect, type Page } from '@playwright/test';

export async function openWorkspaceTab(
  page: Page,
  name: 'Forms' | 'Validations' | 'Fields' | 'Add Field' | 'Preset',
): Promise<void> {
  const drawer = page.getByRole('complementary');
  const mobileNavigation = page.locator('formly-builder > div > core-panel-option-list');
  const isMobile = (page.viewportSize()?.width ?? 1024) < 1024;
  if (isMobile) await expect(mobileNavigation).toBeVisible();
  const panel =
    name === 'Fields'
      ? 'Fields'
      : name === 'Add Field' || name === 'Preset'
        ? 'Add Field'
        : 'Workspace';
  const content = page.locator(
    panel === 'Fields'
      ? 'core-fields-panel'
      : panel === 'Add Field'
        ? 'core-add-field-panel'
        : 'core-forms-panel',
  );
  if (!(await content.isVisible())) {
    const navigation = (await drawer.isVisible())
      ? drawer
      : isMobile
        ? mobileNavigation
        : page.getByRole('main');
    await navigation.getByRole('button', { name: `Open ${panel} panel`, exact: true }).click();
  }
  await expect(content).toBeVisible();
  if (await drawer.isVisible()) {
    await expect.poll(async () => (await drawer.boundingBox())?.x).toBe(0);
  }
  if (name !== 'Fields') {
    await content
      .getByRole('tab', { name: name === 'Add Field' ? 'Field' : name, exact: true })
      .click();
  }
}
