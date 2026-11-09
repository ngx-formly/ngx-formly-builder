import { expect, test } from '@playwright/test';
import { loadMaterialFixture } from './helpers/material-fixture';

test('renders styling options as soon as the dropdown opens', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/form-editor');
  await loadMaterialFixture(page);
  await page.getByRole('button', { name: 'Open Styling panel', exact: true }).click();

  const heightOption = page
    .getByRole('region', { name: 'Size', exact: true })
    .locator('core-styling-option')
    .first();
  const height = heightOption.getByRole('combobox');
  await expect(height).toBeVisible();
  const frames = await height.evaluate(async (element) => {
    const frames: { elapsed: number; visibleOptions: string[] }[] = [];
    const start = performance.now();
    (element as HTMLElement).click();
    while (performance.now() - start < 500) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const overlay = document.querySelector('.p-select-overlay');
      const bounds = overlay?.getBoundingClientRect();
      if (bounds && bounds.height > 0) {
        frames.push({
          elapsed: Math.round(performance.now() - start),
          visibleOptions: Array.from(overlay!.querySelectorAll('[role="option"]'))
            .filter((option) => {
              const item = option.getBoundingClientRect();
              return item.bottom > bounds.top && item.top < bounds.bottom;
            })
            .map((option) => option.textContent?.trim() ?? ''),
        });
      }
    }
    return frames;
  });
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.filter((frame) => !frame.visibleOptions.includes('0'))).toEqual([]);

  await page.getByRole('option', { name: 'fit', exact: true }).click();
  await expect(height).toHaveText('fit');
  const classes = page.getByRole('region', { name: 'CSS Class Names', exact: true });
  await expect(classes).toContainText('h-fit');

  await height.click();
  await expect(page.getByRole('option', { name: 'fit', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(height).toHaveText('0');
  await expect(classes).toContainText('h-0');

  await page.getByRole('button', { name: 'SM', exact: true }).click();
  await height.click();
  await page.getByRole('option', { name: '4', exact: true }).click();
  await expect(height).toHaveText('4');
  await expect(classes).toContainText('sm:h-4');
  await heightOption.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(classes).not.toContainText('sm:h-4');
  await expect(classes).toContainText('h-0');

  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await expect(height).toHaveText('0');
  await heightOption.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(classes).not.toContainText('h-0');
});
