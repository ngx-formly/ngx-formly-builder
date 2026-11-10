import { FormTemplate } from '@ngx-formly/builder';
import { FormlyFieldConfig } from '@ngx-formly/core';

const starterFormFields: FormlyFieldConfig[] = [
  {
    key: 'name',
    type: 'input',
    props: {
      label: 'Name',
      placeholder: 'Your name',
      required: true,
    },
  },
  {
    key: 'email',
    type: 'input',
    props: {
      label: 'Email address',
      placeholder: 'you@example.com',
      type: 'email',
      required: true,
    },
  },
  {
    key: 'topic',
    type: 'select',
    props: {
      label: 'Topic',
      placeholder: 'Choose a topic',
      required: true,
      options: [
        { label: 'General question', value: 'general' },
        { label: 'Product feedback', value: 'feedback' },
        { label: 'Support request', value: 'support' },
      ],
    },
  },
  {
    key: 'message',
    type: 'textarea',
    props: {
      label: 'Message',
      placeholder: 'How can we help?',
      rows: 4,
      required: true,
      minLength: 10,
    },
  },
  {
    key: 'updates',
    type: 'checkbox',
    props: {
      label: 'Send me product updates',
    },
  },
];

const personalDetails: FormlyFieldConfig[] = [
  {
    type: 'formly-group',
    fieldGroupClassName: 'grid grid-cols-2 gap-4',
    fieldGroup: [
      {
        type: 'input',
        key: 'firstName',
        props: { label: 'First Name', placeholder: 'John', required: true },
      },
      {
        type: 'input',
        key: 'lastName',
        props: { label: 'Last Name', placeholder: 'Doe', required: true },
      },
    ],
  },
  {
    type: 'input',
    key: 'email',
    props: {
      label: 'Email',
      type: 'email',
      placeholder: 'john@example.com',
      required: true,
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
  },
  {
    type: 'input',
    key: 'phone',
    props: { label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000' },
  },
];

const exampleCard =
  'block mx-auto w-full max-w-lg rounded-xl border border-surface bg-surface-0 p-6 dark:bg-surface-900';

export const formTemplates: FormTemplate[] = [
  {
    id: 'starter',
    name: 'Starter Form',
    icon: 'edit_note',
    description: 'A simple contact form with common fields, choices, and validation.',
    fields: starterFormFields,
    model: {},
  },
  {
    id: 'expense-report',
    name: 'Expense Report',
    icon: 'receipt_long',
    description: 'Expense details with categories, dates, amounts, and receipt flags.',
    fields: [
      {
        type: 'formly-group',
        key: 'expenseReport',
        fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
        fieldGroup: [
          {
            className: 'col-span-full',
            template:
              '<h2 class="m-0 text-xl font-semibold">Expense Report</h2><p class="mt-2 mb-0 text-muted-color">Submit your expenses and receipt details for reimbursement.</p>',
          },
          { type: 'input', key: 'reportTitle', props: { label: 'Report Title', required: true } },
          { type: 'input', key: 'submitter', props: { label: 'Submitter', required: true } },
          {
            type: 'select',
            key: 'period',
            props: {
              label: 'Period',
              required: true,
              options: [
                { value: 'q1', label: 'Q1' },
                { value: 'q2', label: 'Q2' },
                { value: 'q3', label: 'Q3' },
                { value: 'q4', label: 'Q4' },
              ],
            },
          },
          {
            type: 'input',
            key: 'submittedDate',
            props: { label: 'Submitted Date', type: 'date', required: true },
          },
          { type: 'input', key: 'description', props: { label: 'Description', required: true } },
          {
            type: 'select',
            key: 'category',
            props: {
              label: 'Category',
              required: true,
              options: [
                { value: 'travel', label: 'Travel' },
                { value: 'meals', label: 'Meals' },
                { value: 'lodging', label: 'Lodging' },
                { value: 'supplies', label: 'Supplies' },
                { value: 'other', label: 'Other' },
              ],
            },
          },
          { type: 'input', key: 'date', props: { label: 'Date', type: 'date', required: true } },
          { type: 'number', key: 'amount', props: { label: 'Amount', required: true, min: 0 } },
          { type: 'checkbox', key: 'receipt', props: { label: 'Receipt attached' } },
          {
            type: 'textarea',
            key: 'notes',
            props: { label: 'Notes', placeholder: 'Optional details', rows: 2 },
          },
        ],
      },
    ],
    model: {
      expenseReport: {
        reportTitle: 'Conference Travel',
        submitter: 'Jane Smith',
        period: 'q3',
        submittedDate: '2026-10-02',
        description: 'Flight to conference',
        category: 'travel',
        date: '2026-09-18',
        amount: 420,
        receipt: true,
        notes: 'Economy round trip.',
      },
    },
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    icon: 'mail',
    description: 'Contact details, inquiry subject, and a message for your team.',
    fields: [
      {
        type: 'formly-group',
        className: exampleCard,
        fieldGroupClassName: 'flex flex-col gap-4',
        fieldGroup: [
          {
            template:
              '<h2 class="m-0 text-xl font-semibold">Contact Us</h2><p class="mt-2 mb-0 text-muted-color">Get in touch with our team for any inquiries.</p>',
          },
          ...personalDetails,
          {
            type: 'select',
            key: 'subject',
            props: {
              label: 'Subject',
              placeholder: 'Choose a subject',
              required: true,
              options: [
                { label: 'General inquiry', value: 'general' },
                { label: 'Product support', value: 'support' },
                { label: 'Sales', value: 'sales' },
                { label: 'Feedback', value: 'feedback' },
              ],
            },
          },
          {
            type: 'textarea',
            key: 'message',
            props: {
              label: 'Message',
              placeholder: 'Please provide details about your inquiry...',
              rows: 4,
              required: true,
              minLength: 10,
            },
          },
          { type: 'example-submit', props: { label: 'Send Message' } },
        ],
      },
    ],
    model: {},
  },
  {
    id: 'profile-update',
    name: 'Profile Update',
    icon: 'manage_accounts',
    description: 'Update contact information, a short bio, and a profile picture.',
    fields: [
      {
        type: 'formly-group',
        className: exampleCard,
        fieldGroupClassName: 'flex flex-col gap-4',
        fieldGroup: [
          {
            template:
              '<h2 class="m-0 text-xl font-semibold">Update Profile</h2><p class="mt-2 mb-0 text-muted-color">Keep your profile information up to date.</p>',
          },
          ...personalDetails,
          {
            type: 'textarea',
            key: 'bio',
            props: {
              label: 'Bio',
              placeholder: 'Tell us about yourself...',
              rows: 4,
              maxLength: 500,
            },
          },
          {
            type: 'file',
            key: 'profilePicture',
            props: {
              label: 'Profile Picture',
              accept: 'image/*',
              maxFileSize: 2 * 1024 * 1024,
              description: 'Choose an image up to 2 MB.',
            },
          },
          { type: 'example-submit', props: { label: 'Update Profile' } },
        ],
      },
    ],
    model: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1 (555) 000-0000',
    },
  },
];
