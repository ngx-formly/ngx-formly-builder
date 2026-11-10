import {
  createArrayProperty,
  createBooleanProperty,
  createExpressionsProperty,
  createInputProperty,
  createObjectProperty,
  createSelectProperty,
} from '../../properties';
import { createLibrary } from '../library';
import { nativeFieldConfig, nativeFieldTypes } from '../native-fields';
import { FieldTypeOption } from '../types';
import { VanillaField, VanillaFormField } from './vanilla-field';

export const VANILLA_LIBRARY_ID = 'form-vanilla';

const key = createInputProperty({ label: 'Key', key: 'key', dataType: 'text' });
const label = createInputProperty({ label: 'Label', key: 'props.label', dataType: 'text' });
const description = createInputProperty({
  label: 'Description',
  key: 'props.description',
  dataType: 'text',
});
const placeholder = createInputProperty({
  label: 'Placeholder',
  key: 'props.placeholder',
  dataType: 'text',
});
const expressions = createExpressionsProperty({ label: 'Expressions', key: 'expressions' });
const properties = [
  key,
  label,
  description,
  createBooleanProperty({ label: 'Disabled', key: 'props.disabled' }),
  createBooleanProperty({ label: 'Hide', key: 'hide' }),
  expressions,
];
const validationConfig = {
  rules: [
    {
      name: 'required',
      property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
    },
  ],
  displayProperties: [createBooleanProperty({ label: 'Show Validation', key: 'validation.show' })],
};
const fieldTypes: FieldTypeOption[] = [
  {
    name: 'input',
    keyGenerationPrefix: 'inp',
    displayName: 'Input',
    description: 'Text, email, password and more',
    materialSymbol: 'text_fields',
    defaultConfig: { props: { label: 'Input' } },
    properties: [
      ...properties,
      placeholder,
      createSelectProperty({
        label: 'Type',
        key: 'props.type',
        options: ['text', 'email', 'password', 'tel', 'url', 'date', 'number'].map((value) => ({
          label: value,
          value,
        })),
      }),
    ],
    validationConfig,
  },
  {
    name: 'number',
    keyGenerationPrefix: 'num',
    displayName: 'Number',
    description: 'Numeric value with limits',
    materialSymbol: 'numbers',
    defaultConfig: { props: { label: 'Number', type: 'number' } },
    properties: [...properties, placeholder],
    validationConfig: {
      ...validationConfig,
      rules: [
        ...validationConfig.rules,
        {
          name: 'min',
          property: createInputProperty({ label: 'Min', key: 'props.min', dataType: 'number' }),
        },
        {
          name: 'max',
          property: createInputProperty({ label: 'Max', key: 'props.max', dataType: 'number' }),
        },
      ],
    },
  },
  {
    name: 'textarea',
    keyGenerationPrefix: 'txt',
    displayName: 'Textarea',
    description: 'Multi-line text entry',
    materialSymbol: 'subject',
    defaultConfig: { props: { label: 'Textarea' } },
    properties: [
      ...properties,
      placeholder,
      createInputProperty({ label: 'Rows', key: 'props.rows', dataType: 'number' }),
    ],
    validationConfig,
  },
  {
    name: 'checkbox',
    keyGenerationPrefix: 'chk',
    displayName: 'Checkbox',
    description: 'Single yes-or-no choice',
    materialSymbol: 'check_box',
    defaultConfig: { props: { label: 'Checkbox' } },
    properties,
    validationConfig,
  },
  {
    name: 'select',
    keyGenerationPrefix: 'sel',
    displayName: 'Select',
    description: 'Dropdown list of choices',
    materialSymbol: 'list',
    defaultConfig: {
      props: {
        label: 'Select',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
      },
    },
    properties: [
      ...properties,
      placeholder,
      createArrayProperty({
        label: 'Options',
        key: 'props.options',
        canAdd: true,
        useTableDialog: true,
        childProperty: createObjectProperty({
          isRemovable: true,
          childProperties: [
            createInputProperty({
              label: 'Label',
              key: 'label',
              dataType: 'text',
              isRequired: true,
            }),
            createInputProperty({
              label: 'Value',
              key: 'value',
              dataType: 'text',
              isRequired: true,
            }),
            createBooleanProperty({ label: 'Disabled', key: 'disabled' }),
          ],
        }),
      }),
    ],
    validationConfig,
  },
];

export const vanillaLibraryConfig = createLibrary({
  id: VANILLA_LIBRARY_ID,
  label: 'Vanilla',
  enableFormUploadSchema: true,
  formTemplates: [],
  fieldCategoryOptions: [
    { displayName: 'Form Controls', children: [...fieldTypes, ...nativeFieldTypes] },
    {
      displayName: 'Containers',
      children: [
        {
          name: 'formly-group',
          displayName: 'Group',
          description: 'Related fields in one group',
          materialSymbol: 'ad_group',
          isParent: true,
          disableKeyGeneration: true,
          defaultConfig: { fieldGroup: [] },
          properties: [key, expressions],
        },
      ],
    },
  ],
  configOptions: [
    nativeFieldConfig,
    {
      types: fieldTypes.map((type) => ({
        name: type.name,
        component: VanillaField,
        wrappers: ['form-field'],
        defaultOptions: type.name === 'number' ? { props: { type: 'number' } } : {},
      })),
      wrappers: [{ name: 'form-field', component: VanillaFormField }],
      validationMessages: [
        { name: 'required', message: 'This field is required.' },
        { name: 'min', message: 'The value is too small.' },
        { name: 'max', message: 'The value is too large.' },
      ],
    },
  ],
});
