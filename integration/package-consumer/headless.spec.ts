import { expect, test } from '@playwright/test';

test('the root engine edits and exports fields without any UI peers', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Headless consumer' })).toBeVisible();
  const json = page.locator('pre');
  await expect(json).toContainText('Name');
  await page.getByRole('button', { name: 'Add field', exact: true }).click();
  await expect(json).toContainText('New field');
  await page.getByRole('button', { name: 'Require field', exact: true }).click();
  await expect(json).toContainText('"required": true');
  const fields = JSON.parse((await json.textContent())!);
  expect(fields).toHaveLength(2);
  expect(fields[1]).toMatchObject({ type: 'input', props: { label: 'New field', required: true } });
  expect(fields[1].key).toBeTruthy();
  expect(fields[1]._info).toBeUndefined();
  await page.getByRole('button', { name: 'Remove field', exact: true }).click();
  await expect(json).not.toContainText('New field');
  expect(JSON.parse((await json.textContent())!)).toHaveLength(1);
  expect(errors).toEqual([]);
});
