import { openWorkspaceTab } from './helpers/workspace-tab';
import { loadMaterialFixture as createContactForm } from './helpers/material-fixture';
import { expect, Page, test } from '@playwright/test';

async function createTemplateForm(page: Page, libraryName: string) {
  await page.getByRole('button', { name: 'Create Form' }).first().click();
  const createFormDialog = page.getByRole('dialog', { name: 'Create Form' });
  await page.getByRole('option', { name: libraryName, exact: true }).click();
  await createFormDialog.getByRole('button', { name: 'Starter Form', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Builder', exact: true })).toBeVisible();
}

async function expectNoDocumentOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function expectWithinViewport(page: Page, selector: string) {
  const button = page.getByRole('button', { name: selector, exact: true });
  await expect(button).toBeVisible();
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}

test.describe('Form Editor responsive authoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form-editor');
    await createContactForm(page);
  });

  test('keeps the selected width when switching between preview and builder', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    const toolbar = page.locator('core-form-toolbar core-preview-device-toolbar');
    await toolbar.getByRole('button', { name: 'SM', exact: true }).click();
    await expect(page.locator('core-form-preview-content iframe')).toHaveCSS('width', '640px');

    await page.getByRole('button', { name: 'Builder', exact: true }).click();
    const builder = page.locator('core-form-builder-content');
    await expect(builder).toHaveCSS('width', '640px');
    await expect(toolbar.getByRole('button', { name: 'SM', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await toolbar.getByRole('button', { name: 'Custom', exact: true }).click();
    await toolbar.getByRole('spinbutton').fill('480');
    await toolbar.getByRole('button', { name: 'Confirm width' }).click();
    await expect(builder).toHaveCSS('width', '480px');
    await expect(toolbar).toContainText('480px · 100%');
    const field = builder
      .locator('core-field-wrapper')
      .filter({
        has: page
          .locator('core-formly-field-header > div > span')
          .getByText('reference', { exact: true }),
      })
      .last();
    await field.locator('core-formly-field-header').click();
    await expect(field).toHaveAttribute('aria-pressed', 'true');
    await page.screenshot({ path: testInfo.outputPath('builder-custom-desktop.png') });

    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await expect(page.locator('core-form-preview-content iframe')).toHaveCSS('width', '480px');
    await page.getByRole('button', { name: 'JSON', exact: true }).click();
    await expect(toolbar).toBeHidden();
    await page.getByRole('button', { name: 'Builder', exact: true }).click();
    await expect(builder).toHaveCSS('width', '480px');

    await toolbar.getByRole('button', { name: 'XL', exact: true }).click();
    await expect(builder).toHaveCSS('width', '1280px');
    await expect(toolbar).toContainText('1280px · 100%');
    await expectNoDocumentOverflow(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(builder).toHaveCSS('width', '1280px');
    await expectWithinViewport(page, 'Save Form');
    await expectNoDocumentOverflow(page);

    await toolbar.getByRole('button', { name: 'Auto', exact: true }).click();
    await expect(builder).not.toHaveCSS('width', '1280px');
    const box = await builder.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(375);
    await expectNoDocumentOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('builder-auto-phone.png') });
  });

  test('keeps primary toolbar actions reachable at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(page.getByRole('button', { name: 'Open preview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export Form' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Form' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Builder', exact: true })).toBeVisible();
    await expectWithinViewport(page, 'Open preview');
    await expectWithinViewport(page, 'Export Form');
    await expectWithinViewport(page, 'Save Form');
    await expectNoDocumentOverflow(page);
  });

  test('keeps the Export dialog inside the phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'Export Form' }).click();

    const dialog = page.getByRole('dialog', { name: 'Export Form' });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(343);
    expect(box!.height).toBeLessThanOrEqual(780);
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Beautify JSON' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Export Form' })).toBeVisible();
    for (const action of ['Beautify JSON', 'Export Form']) {
      const actionBox = await dialog.getByRole('button', { name: action }).boundingBox();
      expect(actionBox).not.toBeNull();
      expect(actionBox!.x).toBeGreaterThanOrEqual(0);
      expect(actionBox!.y).toBeGreaterThanOrEqual(0);
      expect(actionBox!.x + actionBox!.width).toBeLessThanOrEqual(375);
      expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(812);
    }
    await expectNoDocumentOverflow(page);
  });

  test('keeps JSON editing usable at the larger phone width', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.getByRole('button', { name: 'JSON' }).click();

    await expect(page.locator('core-json-content .cm-content')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Builder', exact: true })).toBeVisible();
    await expectNoDocumentOverflow(page);
  });

  test('keeps the generated preview usable at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'Open preview' }).click();

    const previewDialog = page.getByRole('dialog', { name: 'Form Preview' });
    await expect(previewDialog).toBeVisible();
    const previewFrame = previewDialog.frameLocator('iframe[title="Responsive form preview"]');
    await expect(previewFrame.locator('input, textarea, [role="combobox"]').first()).toBeVisible();

    const controls = previewFrame.locator('input, textarea, [role="combobox"]');
    for (let index = 0; index < (await controls.count()); index++) {
      const box = await controls.nth(index).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    }

    await expectNoDocumentOverflow(page);
  });

  test('collapses starter form groups to one column on narrow containers', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const contactGroup = page
      .locator('[class~="grid-cols-1"]')
      .filter({ has: page.locator('core-field-wrapper') })
      .first();
    await expect(contactGroup).toBeVisible();
    await expect
      .poll(() => contactGroup.evaluate((element) => getComputedStyle(element).gridTemplateColumns))
      .toMatch(/^\S+$/);
    await expectNoDocumentOverflow(page);
  });

  test('adds a root field when no field is selected', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openWorkspaceTab(page, 'Forms');
    await page.getByRole('complementary').getByRole('button', { name: 'Create Form' }).click();
    const createFormDialog = page.getByRole('dialog', { name: 'Create Form' });
    await createFormDialog
      .getByRole('button', { name: 'Start with a blank form', exact: true })
      .click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('complementary')).toBeHidden();
    await openWorkspaceTab(page, 'Add Field');

    const checkbox = page.locator('core-type-container').filter({
      has: page.getByText('Checkbox', { exact: true }),
    });
    await checkbox.getByRole('button', { name: 'Add Field' }).click();
    await expect(page.getByRole('menuitem', { name: 'Add to form' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Add to form' }).click();
    await expect(page.locator('core-form-builder-content [aria-label^="Field "]')).toHaveCount(1);
    await expect(page.locator('core-form-builder-content [aria-pressed="true"]')).toHaveCount(1);
  });

  test('adds fields from contextual palette actions without dragging', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openWorkspaceTab(page, 'Add Field');

    const formContent = page.locator('core-form-builder-content');
    const inputSource = page.locator('core-type-container').filter({ hasText: 'Input' }).first();

    await inputSource.getByRole('button', { name: 'Add Field' }).click();
    await expect(page.getByRole('menuitem', { name: 'Add inside supportRequest' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Add before supportRequest' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Add after supportRequest' })).toBeVisible();

    const initialFieldCount = await formContent.locator('[aria-label^="Field "]').count();
    await page.getByRole('menuitem', { name: 'Add before supportRequest' }).click();
    await expect(formContent.locator('[aria-label^="Field "]')).toHaveCount(initialFieldCount + 1);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('complementary')).toBeHidden();
    await formContent
      .locator('core-formly-field-header')
      .filter({ hasText: 'supportRequest' })
      .click();
    await openWorkspaceTab(page, 'Add Field');
    await inputSource.getByRole('button', { name: 'Add Field' }).click();
    await page.getByRole('menuitem', { name: 'Add after supportRequest' }).click();
    await expect(formContent.locator('[aria-label^="Field "]')).toHaveCount(initialFieldCount + 2);
    await expect(formContent.locator('[aria-pressed="true"]')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('complementary')).toBeHidden();
    await formContent
      .locator('core-formly-field-header')
      .filter({ hasText: 'supportRequest' })
      .click();
    await openWorkspaceTab(page, 'Add Field');
    const refreshedInputSource = page
      .locator('core-type-container')
      .filter({ hasText: 'Input' })
      .first();
    await refreshedInputSource.getByRole('button', { name: 'Add Field' }).click();
    await expect(page.getByRole('menuitem', { name: 'Add inside supportRequest' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Add inside supportRequest' }).click();
    await expect(formContent.locator('[aria-label^="Field "]')).toHaveCount(initialFieldCount + 3);
    await expect(formContent.locator('[aria-pressed="true"]')).toHaveCount(1);
    await page.keyboard.press('Escape');

    const addFieldPanel = page.getByRole('complementary');
    await expect(addFieldPanel).toBeHidden();
    await openWorkspaceTab(page, 'Add Field');
    await expect(addFieldPanel).toBeVisible();
    const currentAddButton = page
      .locator('core-add-field-panel core-type-container')
      .filter({ hasText: 'Input' })
      .first()
      .getByRole('button', { name: 'Add Field' });
    await expect(currentAddButton).toBeVisible();
    await currentAddButton.scrollIntoViewIfNeeded();
    await currentAddButton.click({ force: true });
    const addAfterMenu = page.locator('[role="menu"]:visible').last();
    await expect(addAfterMenu.getByRole('menuitem', { name: /Add after inp_/i })).toBeVisible();
    await addAfterMenu.getByRole('menuitem', { name: /Add after inp_/i }).click();
    await expect(formContent.locator('[aria-label^="Field "]')).toHaveCount(initialFieldCount + 4);
    await expectNoDocumentOverflow(page);
  });

  test('moves fields up and down within the root', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openWorkspaceTab(page, 'Forms');
    await page.getByRole('complementary').getByRole('button', { name: 'Create Form' }).click();
    const createFormDialog = page.getByRole('dialog', { name: 'Create Form' });
    await createFormDialog
      .getByRole('button', { name: 'Start with a blank form', exact: true })
      .click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('complementary')).toBeHidden();
    await openWorkspaceTab(page, 'Add Field');

    const inputSource = page.locator('core-type-container').filter({ hasText: 'Input' }).first();
    const addField = async (label: string) => {
      await inputSource.getByRole('button', { name: 'Add Field' }).click();
      await page.getByRole('menuitem', { name: label }).click();
    };

    await addField('Add to form');
    await addField('Add after inp_');
    await expect(page.locator('core-form-builder-content [aria-label^="Field "]')).toHaveCount(2);
    await page.keyboard.press('Escape');

    const headers = page.locator('core-formly-field-header');
    await headers.nth(1).getByRole('button', { name: 'Options' }).click();
    const secondFieldMenu = page.locator('[role="menu"]:visible').last();
    await expect(secondFieldMenu.getByRole('menuitem', { name: 'Move up' })).toBeVisible();
    await secondFieldMenu.getByRole('menuitem', { name: 'Move up' }).click();

    await page
      .locator('core-form-builder-content [aria-pressed="true"] core-formly-field-header')
      .getByRole('button', { name: 'Options' })
      .click();
    const firstFieldMenu = page.locator('[role="menu"]:visible').last();
    await expect(firstFieldMenu.getByRole('menuitem', { name: 'Move up' })).toBeHidden();
    await expect(firstFieldMenu.getByRole('menuitem', { name: 'Move down' })).toBeVisible();
    await firstFieldMenu.getByRole('menuitem', { name: 'Move down' }).press('Enter');
    await expectNoDocumentOverflow(page);
  });

  test('uses the same contextual destinations for presets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openWorkspaceTab(page, 'Preset');

    const presetSource = page.locator('core-type-container').filter({ hasText: 'Email' }).first();
    await presetSource.getByRole('button', { name: 'Add Field' }).click();
    const action = page
      .getByRole('menuitem', { name: /Add inside supportRequest|Add after supportRequest/ })
      .first();

    await expect(action).toBeVisible();
    const initialFieldCount = await page
      .locator('core-form-builder-content [aria-label^="Field "]')
      .count();
    await action.click();
    await expect(page.locator('core-form-builder-content [aria-label^="Field "]')).toHaveCount(
      initialFieldCount + 1,
    );
    await expect(page.locator('core-form-builder-content [aria-pressed="true"]')).toHaveCount(1);
  });

  test('preserves toolbar and dialog actions at tablet and desktop widths', async ({ page }) => {
    for (const viewport of [
      { width: 1024, height: 768 },
      { width: 1536, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await expect(page.getByRole('button', { name: 'Open preview' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Export Form' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save Form' })).toBeVisible();
      await expectNoDocumentOverflow(page);
    }
  });
});

test.describe('Form Editor responsive starter forms', () => {
  for (const library of ['Bootstrap', 'Ng Zorro']) {
    test(`keeps ${library} controls usable at phone width`, async ({ page }) => {
      await page.goto('/form-editor');
      await createTemplateForm(page, library);
      await page.setViewportSize({ width: 375, height: 812 });

      const formContent = page.locator('core-form-builder-content');
      await expect(formContent.locator('input, textarea, [role="combobox"]').first()).toBeVisible();
      await expectNoDocumentOverflow(page);

      const controls = formContent.locator('input, textarea, [role="combobox"]');
      for (let index = 0; index < (await controls.count()); index++) {
        const box = await controls.nth(index).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(375);
      }
    });
  }
});
