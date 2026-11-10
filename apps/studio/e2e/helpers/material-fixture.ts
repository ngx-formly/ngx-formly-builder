import { openWorkspaceTab } from './workspace-tab';
import type { DefaultForm } from '@ngx-formly/builder';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { expect, Page } from '@playwright/test';

const materialShowcaseFields: FormlyFieldConfig[] = [
  {
    type: 'formly-group',
    key: 'supportRequest',
    fieldGroupClassName: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fieldGroup: [
      {
        type: 'input',
        key: 'customerName',
        props: {
          label: 'Customer name',
          placeholder: 'Jane Smith',
          required: true,
        },
      },
      {
        type: 'string',
        key: 'reference',
        props: {
          label: 'Reference',
          placeholder: 'SUP-1042',
        },
      },
      {
        type: 'number',
        key: 'accountNumber',
        props: {
          label: 'Account number',
          placeholder: '1042',
          min: 1,
        },
      },
      {
        type: 'datepicker',
        key: 'preferredDate',
        props: {
          label: 'Preferred follow-up date',
          required: true,
        },
      },
      {
        type: 'select',
        key: 'topic',
        props: {
          label: 'Topic',
          placeholder: 'Select a topic',
          required: true,
          options: [
            { value: 'general', label: 'General question' },
            { value: 'support', label: 'Technical support' },
            { value: 'billing', label: 'Billing' },
            { value: 'feedback', label: 'Product feedback' },
          ],
        },
      },
      {
        type: 'radio',
        key: 'contactMethod',
        props: {
          label: 'Preferred contact method',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
          ],
        },
      },
      {
        type: 'multicheckbox',
        key: 'affectedAreas',
        props: {
          label: 'Affected areas',
          options: [
            { value: 'builder', label: 'Builder' },
            { value: 'preview', label: 'Preview' },
            { value: 'export', label: 'Export' },
          ],
        },
      },
      {
        type: 'toggle',
        key: 'includeUpdates',
        props: {
          label: 'Send progress updates',
        },
      },
      {
        type: 'checkbox',
        key: 'consent',
        props: {
          label: 'I agree to be contacted about this request',
          required: true,
        },
      },
      {
        type: 'textarea',
        key: 'message',
        className: 'sm:col-span-2',
        props: {
          label: 'Message',
          placeholder: 'How can we help?',
          required: true,
          rows: 4,
        },
      },
    ],
  },
];

const materialShowcaseModel: Record<string, unknown> = {
  supportRequest: {
    customerName: 'Jane Smith',
    reference: 'SUP-1042',
    accountNumber: 1042,
    preferredDate: new Date('2026-09-18'),
    topic: 'support',
    contactMethod: 'email',
    affectedAreas: ['builder', 'export'],
    urgency: 3,
    includeUpdates: true,
    consent: true,
    message: 'I need help wiring validation messages into an exported form.',
  },
};

const materialFixture: DefaultForm = {
  name: 'Material Showcase',
  libraryId: 'form-material',
  icon: 'dashboard',
  description: 'A support request demonstrating the complete Material field catalog.',
  fields: materialShowcaseFields,
  model: materialShowcaseModel,
};

/** Keeps advanced Material regression coverage independent of the shared example picker. */
export async function loadMaterialFixture(page: Page) {
  await page.evaluate(
    (form) => {
      localStorage.setItem('formly-studio-forms-form-editor', JSON.stringify({ [form.id]: form }));
      localStorage.removeItem('formly-studio-hierarchy-form-editor');
    },
    { ...materialFixture, id: 'material-test-fixture', name: 'New Form' },
  );
  await page.reload();
  await openWorkspaceTab(page, 'Forms');
  await page.getByRole('button', { name: 'Open form New Form', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Builder', exact: true })).toBeVisible();
  await expect(page.locator('core-form-builder-content')).toContainText('supportRequest');
}
