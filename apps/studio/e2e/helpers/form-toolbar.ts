import { expect, Page } from '@playwright/test';

export async function clickFormAction(page: Page, name: string) {
  const toolbar = page.locator('core-form-toolbar');
  const inline = toolbar.getByRole('button', { name, exact: true });
  const more = toolbar.getByRole('button', { name: 'More form actions', exact: true });
  await expect(inline.or(more)).toBeVisible();

  if (await more.isVisible()) {
    await more.click();
    await page
      .getByRole('menu', { name: 'Form actions' })
      .getByRole('menuitem', { name, exact: true })
      .click();
  } else {
    await inline.click();
  }
}
