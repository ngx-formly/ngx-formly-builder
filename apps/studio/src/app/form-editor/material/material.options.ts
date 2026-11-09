import {
  createArrayProperty,
  createBooleanProperty,
  createCustomValidationProperty,
  createDateProperty,
  createExpressionsProperty,
  createInputProperty,
  createMarkdownProperty,
  createObjectProperty,
  createSelectProperty,
  FieldTypeOption,
  nativeFieldTypes,
  FieldWrapperOption,
} from '@ngx-formly/builder';

export const labelProp = createInputProperty({
  label: 'Label',
  key: 'props.label',
  dataType: 'text',
  description: 'The visible field label displayed to users.',
});

export const descriptionProp = createInputProperty({
  label: 'Description',
  key: 'props.description',
  dataType: 'text',
  description: 'Helper text displayed below the field to guide users.',
});

export const keyProp = createInputProperty({
  label: 'Key',
  key: 'key',
  dataType: 'text',
  description: `Unique key used to bind the field's value in the form model.`,
});

export const hideProp = createBooleanProperty({
  label: 'Hide',
  key: 'hide',
  description: 'If true, the field is not rendered in the form.',
  colSpan: 1,
});

export const expressionsProp = createExpressionsProperty({
  label: 'Expressions',
  key: 'expressions',
  description: 'Expressions to dynamically change field and model properties.',
});

export const requiredProp = createBooleanProperty({
  label: 'Required',
  key: 'props.required',
  description: 'Mark this field as required for form validation.',
});

export const showValidationProp = createBooleanProperty({
  label: 'Show Validation',
  key: 'validation.show',
  description: 'Toggle whether validation messages are always displayed for this field.',
  colSpan: 1,
});

const formFieldWrapperConfig: FieldWrapperOption = {
  name: 'form-field',
  label: 'Form Field',
  properties: [
    createSelectProperty({
      label: 'Float Label',
      key: 'props.floatLabel',
      options: [
        { label: 'Always', value: 'always' },
        { label: 'Auto', value: 'auto' },
      ],
      description: 'Controls whether and how the label floats above the input.',
    }),
    createBooleanProperty({
      label: 'Hide Label',
      key: 'props.hideLabel',
      description: 'Hide the label visually for this wrapper.',
    }),
    createBooleanProperty({
      label: 'Hide Required Marker',
      key: 'props.hideRequiredMarker',
      description: 'Hide the required indicator (asterisk) for this wrapper.',
    }),
  ],
};

export const formFieldWrapperOptions = [formFieldWrapperConfig];

export const groupTypeConfig: FieldTypeOption = {
  displayName: 'Group',
  name: 'formly-group',
  materialSymbol: 'ad_group',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [keyProp, hideProp, expressionsProp],
};

const placeholderProp = createInputProperty({
  label: 'Placeholder',
  key: 'props.placeholder',
  dataType: 'text',
  description: 'Placeholder text shown inside the input when empty.',
});
const readonlyProp = createBooleanProperty({
  label: 'Readonly',
  key: 'props.readonly',
  description: 'When true, the field is displayed but cannot be edited.',
  colSpan: 1,
});
const minLengthProp = createInputProperty({
  label: 'Min Length',
  key: 'props.minLength',
  dataType: 'number',
  description: 'Minimum number of characters allowed for the field value.',
});
const maxLengthProp = createInputProperty({
  label: 'Max Length',
  key: 'props.maxLength',
  dataType: 'number',
  description: 'Maximum number of characters allowed for the field value.',
});
const patternProp = createInputProperty({
  label: 'Pattern',
  key: 'props.pattern',
  dataType: 'text',
  description: 'Regular expression pattern for input validation.',
});
const customValidationProp = createCustomValidationProperty({
  label: 'Custom Validation',
  key: 'validators.validation',
  validationOptions: [{ label: 'IP Address', value: 'ip' }],
  description: `Configure validators that aren't built-in.`,
});
const asyncValidationProp = createCustomValidationProperty({
  label: 'Async Validation',
  key: 'asyncValidators.validation',
  validationOptions: [{ label: 'IP Address', value: 'ipAsync' }],
  description: 'Configure asynchronous validators registered by the active library.',
});
const defaultValidationConfig = {
  rules: [{ name: 'required', property: requiredProp }],
  displayProperties: [showValidationProp],
};

export const inputTypeConfig: FieldTypeOption = {
  displayName: 'Input',
  name: 'input',
  materialSymbol: 'text_fields',
  keyGenerationPrefix: 'inp',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    createSelectProperty({
      label: 'Type',
      key: 'props.type',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Password', value: 'password' },
        { label: 'Telephone', value: 'tel' },
        { label: 'Date', value: 'date' },
        { label: 'URL', value: 'url' },
        { label: 'Number', value: 'number' },
      ],
      description: 'The HTML input type to use for this field (affects keyboard and validation).',
    }),
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      { name: 'minLength', property: minLengthProp },
      { name: 'maxLength', property: maxLengthProp },
      { name: 'pattern', property: patternProp },
    ],
    customValidators: customValidationProp,
    asyncValidators: asyncValidationProp,
  },
};

export const textTypeConfig: FieldTypeOption = {
  displayName: 'Text',
  name: 'string',
  materialSymbol: 'match_case',
  keyGenerationPrefix: 'txt',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      { name: 'minLength', property: minLengthProp },
      { name: 'maxLength', property: maxLengthProp },
      { name: 'pattern', property: patternProp },
    ],
  },
  initialPresets: [
    {
      id: 'email',
      displayName: 'Email',
      field: {
        type: 'input',
        props: {
          label: 'Email',
          type: 'email',
        },
      },
    },
  ],
};

export const numberTypeConfig: FieldTypeOption = {
  displayName: 'Number',
  name: 'number',
  materialSymbol: 'numbers',
  keyGenerationPrefix: 'num',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'number',
      description: 'Default numeric value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      {
        name: 'min',
        property: createInputProperty({
          label: 'Min',
          key: 'props.min',
          dataType: 'number',
          description: 'Minimum numeric value allowed for this field.',
        }),
      },
      {
        name: 'max',
        property: createInputProperty({
          label: 'Max',
          key: 'props.max',
          dataType: 'number',
          description: 'Maximum numeric value allowed for this field.',
        }),
      },
    ],
  },
};

export const textareaTypeConfig: FieldTypeOption = {
  displayName: 'Textarea',
  name: 'textarea',
  materialSymbol: 'subject',
  keyGenerationPrefix: 'txt',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    createInputProperty({
      label: 'Rows',
      key: 'props.rows',
      dataType: 'number',
      description: 'Number of visible rows for the textarea.',
    }),
    createBooleanProperty({
      label: 'Auto Size',
      key: 'props.autosize',
      description: 'Automatically grow or shrink textarea height based on content.',
    }),
    createInputProperty({
      label: 'Auto Size Min Rows',
      key: 'props.autosizeMinRows',
      dataType: 'number',
      description: 'Minimum number of rows when autosize is enabled.',
      colSpan: 1,
    }),
    createInputProperty({
      label: 'Auto Size Max Rows',
      key: 'props.autosizeMaxRows',
      dataType: 'number',
      description: 'Maximum number of rows when autosize is enabled.',
      colSpan: 1,
    }),
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    ...defaultValidationConfig,
    rules: [
      ...defaultValidationConfig.rules,
      { name: 'minLength', property: minLengthProp },
      { name: 'maxLength', property: maxLengthProp },
    ],
  },
};

export const datepickerTypeConfig: FieldTypeOption = {
  displayName: 'Date',
  name: 'datepicker',
  materialSymbol: 'event',
  keyGenerationPrefix: 'dtp',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createDateProperty({
      label: 'Default Value',
      key: 'defaultValue',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    createSelectProperty({
      label: 'Start View',
      key: 'props.datepickerOptions.startView',
      options: [
        { label: 'Month', value: 'month' },
        { label: 'Year', value: 'year' },
        { label: 'Multi-Year', value: 'multi-year' },
      ],
      description: 'Initial calendar view when the datepicker is opened.',
    }),
    createSelectProperty({
      label: 'Toggle Position',
      key: 'props.datepickerOptions.datepickerTogglePosition',
      options: [
        { label: 'Prefix', value: 'prefix' },
        { label: 'Suffix', value: 'suffix' },
      ],
      description: 'Position of the datepicker toggle relative to the input.',
    }),
    createBooleanProperty({
      label: 'Touch UI',
      key: 'props.datepickerOptions.touchUi',
      description: 'Use touch-friendly UI for the datepicker (larger targets).',
    }),
    readonlyProp,
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const checkboxTypeConfig: FieldTypeOption = {
  displayName: 'Checkbox',
  name: 'checkbox',
  materialSymbol: 'check_box',
  keyGenerationPrefix: 'chk',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Default Value',
      key: 'defaultValue',
      description: 'Default boolean value for the checkbox when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
      description: 'Position of the label relative to the checkbox control.',
    }),
    createBooleanProperty({
      label: 'Indeterminate',
      key: 'props.indeterminate',
      description: 'Render the checkbox in an indeterminate (mixed) visual state.',
    }),
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const radioTypeConfig: FieldTypeOption = {
  displayName: 'Radio',
  name: 'radio',
  materialSymbol: 'radio_button_checked',
  keyGenerationPrefix: 'rad',
  defaultConfig: {
    props: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
      description: 'Position of the label relative to the control.',
    }),
    hideProp,
    createArrayProperty({
      label: 'Options',
      key: 'props.options',
      canAdd: true,
      useTableDialog: true,
      description: 'A list of options used to populate the field choices.',
      childProperty: createObjectProperty({
        isRemovable: true,
        childProperties: [
          createInputProperty({
            label: 'Label',
            key: 'label',
            dataType: 'text',
            description: 'Text displayed for this option.',
          }),
          createInputProperty({
            label: 'Value',
            key: 'value',
            dataType: 'text',
            description: 'Value stored in the model when this option is selected.',
            colSpan: 1,
          }),
          createBooleanProperty({
            label: 'Disabled',
            key: 'disabled',
            description: 'If true, this option is disabled and cannot be selected.',
            colSpan: 1,
          }),
        ],
      }),
    }),
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const multicheckboxTypeConfig: FieldTypeOption = {
  displayName: 'Multi Checkbox',
  name: 'multicheckbox',
  materialSymbol: 'check_box',
  keyGenerationPrefix: 'mcb',
  defaultConfig: {
    props: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
    }),
    hideProp,
    createArrayProperty({
      label: 'Options',
      key: 'props.options',
      canAdd: true,
      useTableDialog: true,
      description: 'A list of options used to populate the field choices.',
      childProperty: createObjectProperty({
        isRemovable: true,
        childProperties: [
          createInputProperty({
            label: 'Label',
            key: 'label',
            dataType: 'text',
            description: 'Text displayed for this option.',
          }),
          createInputProperty({
            label: 'Value',
            key: 'value',
            dataType: 'text',
            description: 'Value stored in the model when this option is selected.',
            colSpan: 1,
          }),
          createBooleanProperty({
            label: 'Disabled',
            key: 'disabled',
            description: 'If true, this option is disabled and cannot be selected.',
            colSpan: 1,
          }),
        ],
      }),
    }),
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const toggleTypeConfig: FieldTypeOption = {
  displayName: 'Toggle',
  name: 'toggle',
  materialSymbol: 'toggle_on',
  keyGenerationPrefix: 'tgl',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Default Value',
      key: 'defaultValue',
      description: 'Default boolean value for the toggle when the form loads.',
    }),
    labelProp,
    descriptionProp,
    createSelectProperty({
      label: 'Label Position',
      key: 'props.labelPosition',
      options: [
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
      description: 'Position of the label relative to the toggle control.',
    }),
    hideProp,
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const selectTypeConfig: FieldTypeOption = {
  displayName: 'Select',
  name: 'select',
  materialSymbol: 'list',
  keyGenerationPrefix: 'sel',
  defaultConfig: {
    props: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default value populated into the field when the form loads.',
    }),
    labelProp,
    placeholderProp,
    descriptionProp,
    createBooleanProperty({
      label: 'Multiple Selections',
      key: 'props.multiple',
      description: 'Allow selecting multiple options from the list.',
    }),
    createInputProperty({
      label: 'Select All Options Label',
      key: 'props.selectAllOption',
      dataType: 'text',
      description: 'Label used for the "select all" option when multiple selection is enabled.',
    }),
    hideProp,
    createArrayProperty({
      label: 'Options',
      key: 'props.options',
      canAdd: true,
      useTableDialog: true,
      description: 'A list of options used to populate the control choices.',
      childProperty: createObjectProperty({
        isRemovable: true,
        childProperties: [
          createInputProperty({
            label: 'Label',
            key: 'label',
            dataType: 'text',
            description: 'Text displayed for this option.',
            isRequired: true,
          }),
          createInputProperty({
            label: 'Value',
            key: 'value',
            dataType: 'text',
            description: 'Value stored in the model when this option is selected.',
            isRequired: true,
            colSpan: 1,
          }),
          createBooleanProperty({
            label: 'Disabled',
            key: 'disabled',
            description: 'If true, this option is disabled and cannot be selected.',
            colSpan: 1,
          }),
        ],
      }),
    }),
    expressionsProp,
  ],
  validationConfig: defaultValidationConfig,
};

export const materialBasicFieldTypeOptions = [
  inputTypeConfig,
  textTypeConfig,
  numberTypeConfig,
  textareaTypeConfig,
  datepickerTypeConfig,
  multicheckboxTypeConfig,
  toggleTypeConfig,
  checkboxTypeConfig,
  radioTypeConfig,
  selectTypeConfig,
  ...nativeFieldTypes,
];

const cardTitleProp = createInputProperty({
  label: 'Card Title',
  key: 'props.cardTitle',
  dataType: 'text',
  description: 'Title text displayed at the top of the card.',
});
const cardSubtitleProp = createInputProperty({
  label: 'Card Subtitle',
  key: 'props.cardSubtitle',
  dataType: 'text',
  description: 'Secondary text displayed below the card title.',
});

const cardWrapperConfig: FieldWrapperOption = {
  name: 'card',
  label: 'Card',
  properties: [cardTitleProp, cardSubtitleProp],
};

const cardWrapperOptions = [cardWrapperConfig];

const cardTypeConfig: FieldTypeOption = {
  displayName: 'Card',
  name: 'card',
  materialSymbol: 'credit_card',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [keyProp, cardTitleProp, cardSubtitleProp, hideProp, expressionsProp],
};

const repeatTypeConfig: FieldTypeOption = {
  displayName: 'Repeater',
  name: 'repeating-section',
  materialSymbol: 'repeat',
  keyGenerationPrefix: 'rep',
  isParent: true,
  isFieldArray: true,
  defaultConfig: {
    fieldArray: {},
  },
  wrapperOptions: cardWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Add Button Text',
      key: 'props.addText',
      dataType: 'text',
      description: 'Text displayed on the button that adds a new repeat section.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const stepTypeConfig: FieldTypeOption = {
  displayName: 'Step',
  name: 'step',
  materialSymbol: 'step',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    labelProp,
    createBooleanProperty({
      label: 'Optional',
      key: 'props.optional',
      description: 'Allow users to advance without completing this step.',
    }),
    createBooleanProperty({
      label: 'Disable Edit',
      key: 'props.disableEdit',
      description: 'Prevent users from returning to this step after completing it.',
    }),
    createInputProperty({
      label: 'Previous Button Label',
      key: 'props.previousButtonLabel',
      dataType: 'text',
      description: 'Text displayed on the button that returns to the previous step.',
    }),
    createInputProperty({
      label: 'Next Button Label',
      key: 'props.nextButtonLabel',
      dataType: 'text',
      description: 'Text displayed on the button that advances to the next step.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const stepperTypeConfig: FieldTypeOption = {
  displayName: 'Stepper',
  name: 'stepper',
  materialSymbol: 'view_timeline',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Linear',
      key: 'props.linear',
      description: 'Require each non-optional step to be valid before advancing.',
      clearOnFalse: false,
    }),
    createSelectProperty({
      label: 'Orientation',
      key: 'props.orientation',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
      description: 'Direction used to lay out the step headers and content.',
    }),
    createInputProperty({
      label: 'Accessible Label',
      key: 'props.ariaLabel',
      dataType: 'text',
      description: 'Accessible name announced for the stepper.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const tabTypeConfig: FieldTypeOption = {
  displayName: 'Tab',
  name: 'tab',
  materialSymbol: 'tab',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    labelProp,
    createBooleanProperty({
      label: 'Disabled',
      key: 'props.disabled',
      description: 'Prevent users from selecting this tab.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const tabsTypeConfig: FieldTypeOption = {
  displayName: 'Tabs',
  name: 'tabs',
  materialSymbol: 'tab_group',
  disableKeyGeneration: true,
  isParent: true,
  defaultConfig: {
    fieldGroup: [],
  },
  properties: [
    keyProp,
    createBooleanProperty({
      label: 'Dynamic Height',
      key: 'props.dynamicHeight',
      description: 'Grow the tab group to match the active tab content height.',
    }),
    createSelectProperty({
      label: 'Header Position',
      key: 'props.headerPosition',
      options: [
        { label: 'Above', value: 'above' },
        { label: 'Below', value: 'below' },
      ],
      description: 'Position of the tab headers relative to the tab content.',
    }),
    createSelectProperty({
      label: 'Tab Alignment',
      key: 'props.alignTabs',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
      ],
      description: 'Alignment of the tab labels within the header.',
    }),
    createBooleanProperty({
      label: 'Disable Stretch Tabs',
      key: 'props.disableStretchTabs',
      description: 'Disable stretching tab labels to fill the available header width.',
      clearOnFalse: false,
    }),
    createBooleanProperty({
      label: 'Fit Ink Bar to Content',
      key: 'props.fitInkBarToContent',
      description: 'Fit the active indicator to the tab label content.',
    }),
    createBooleanProperty({
      label: 'Preserve Content',
      key: 'props.preserveContent',
      description: 'Keep inactive tab content mounted after it has been visited.',
      clearOnFalse: false,
    }),
    hideProp,
    expressionsProp,
  ],
};

const optionsProperty = createArrayProperty({
  label: 'Options',
  key: 'props.options',
  canAdd: true,
  useTableDialog: true,
  description: 'A list of buttons used to populate the control choices.',
  childProperty: createObjectProperty({
    isRemovable: true,
    childProperties: [
      createInputProperty({
        label: 'Label',
        key: 'label',
        dataType: 'text',
        description: 'Text displayed for this button.',
        isRequired: true,
      }),
      createInputProperty({
        label: 'Value',
        key: 'value',
        dataType: 'text',
        description: 'String value stored in the model when this button is selected.',
        isRequired: true,
        colSpan: 1,
      }),
      createBooleanProperty({
        label: 'Disabled',
        key: 'disabled',
        description: 'If true, this button cannot be selected.',
        colSpan: 1,
      }),
    ],
  }),
});

export const buttonGroupTypeConfig: FieldTypeOption = {
  displayName: 'Button Group',
  name: 'button-group',
  materialSymbol: 'view_week',
  keyGenerationPrefix: 'btn',
  defaultConfig: {
    props: {
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'String value selected when the form loads.',
    }),
    labelProp,
    descriptionProp,
    hideProp,
    optionsProperty,
    expressionsProp,
  ],
  validationConfig: {
    rules: [{ name: 'required', property: requiredProp }],
    displayProperties: [showValidationProp],
  },
};

export const postalCodeTypeConfig: FieldTypeOption = {
  displayName: 'Postal Code',
  name: 'postal-code',
  materialSymbol: 'location_on',
  keyGenerationPrefix: 'postal',
  defaultConfig: {},
  wrapperOptions: formFieldWrapperOptions,
  properties: [
    keyProp,
    createInputProperty({
      label: 'Default Value',
      key: 'defaultValue',
      dataType: 'text',
      description: 'Default postal code populated when the form loads.',
    }),
    labelProp,
    createInputProperty({
      label: 'Placeholder',
      key: 'props.placeholder',
      dataType: 'text',
      description: 'Example postal code shown while the field is empty.',
    }),
    descriptionProp,
    createInputProperty({
      label: 'Mask',
      key: 'props.mask',
      dataType: 'text',
      description: 'Fixed input mask using 0 for digits, A for letters, and * for either.',
    }),
    createSelectProperty({
      label: 'Input Mode',
      key: 'props.inputMode',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Numeric', value: 'numeric' },
      ],
      description: 'Virtual keyboard suggested to browsers on supported devices.',
    }),
    createBooleanProperty({
      label: 'Auto-capitalize',
      key: 'props.autoCapitalize',
      description: 'Uppercase entered letters and request uppercase virtual-keyboard input.',
      clearOnFalse: false,
    }),
    createBooleanProperty({
      label: 'Store Raw Value',
      key: 'props.storeRawValue',
      description: 'Store only letters and digits while displaying the formatted postal code.',
    }),
    createSelectProperty({
      label: 'Autocomplete Context',
      key: 'props.autocompleteContext',
      options: [
        { label: 'Unscoped', value: 'unscoped' },
        { label: 'Shipping', value: 'shipping' },
        { label: 'Billing', value: 'billing' },
      ],
      description: 'Address context used by browser postal-code autofill.',
    }),
    hideProp,
    expressionsProp,
  ],
  validationConfig: {
    rules: [
      { name: 'required', property: requiredProp },
      {
        name: 'postalCodePattern',
        property: createInputProperty({
          label: 'Postal Code Pattern',
          key: 'props.postalCodePattern',
          dataType: 'text',
          description: 'Regular expression matched against the formatted uppercase value.',
        }),
      },
    ],
    displayProperties: [showValidationProp],
  },
  initialPresets: [
    {
      id: 'us-zip-code',
      displayName: 'US ZIP Code',
      isRemovable: false,
      field: {
        type: 'postal-code',
        props: {
          label: 'ZIP Code',
          mask: '00000',
          inputMode: 'numeric',
          autoCapitalize: false,
          autocompleteContext: 'unscoped',
          postalCodePattern: '^[0-9]{5}$',
        },
      },
    },
    {
      id: 'canada-postal-code',
      displayName: 'Canada Postal Code',
      isRemovable: false,
      field: {
        type: 'postal-code',
        props: {
          label: 'Postal Code',
          mask: 'A0A 0A0',
          inputMode: 'text',
          autoCapitalize: true,
          autocompleteContext: 'unscoped',
          postalCodePattern:
            '^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]$',
        },
      },
    },
  ],
};

export const markdownTypeConfig: FieldTypeOption = {
  displayName: 'Markdown',
  name: 'markdown',
  materialSymbol: 'markdown',
  disableKeyGeneration: true,
  defaultConfig: {
    props: {
      text: '## Markdown\n\nWrite formatted content here.',
    },
  },
  properties: [
    createMarkdownProperty({
      label: 'Text',
      key: 'props.text',
      description: 'Markdown content rendered by the field.',
      placeholder: 'Write Markdown content...',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const dividerTypeConfig: FieldTypeOption = {
  displayName: 'Divider',
  name: 'divider',
  materialSymbol: 'horizontal_rule',
  disableKeyGeneration: true,
  defaultConfig: {
    props: {},
  },
  properties: [
    createBooleanProperty({
      label: 'Vertical',
      key: 'props.vertical',
      description: 'Render the divider vertically instead of horizontally.',
    }),
    createBooleanProperty({
      label: 'Inset',
      key: 'props.inset',
      description: 'Inset the divider from the content edges.',
    }),
    hideProp,
    expressionsProp,
  ],
};

export const materialContainerTypeOptions = [
  { ...groupTypeConfig, wrapperOptions: cardWrapperOptions },
  cardTypeConfig,
  repeatTypeConfig,
  tabTypeConfig,
  tabsTypeConfig,
  stepTypeConfig,
  stepperTypeConfig,
];

export const materialFieldCategoryOptions = [
  {
    displayName: 'Display',
    children: [markdownTypeConfig, dividerTypeConfig],
  },
  {
    displayName: 'Form Controls',
    children: [...materialBasicFieldTypeOptions, buttonGroupTypeConfig, postalCodeTypeConfig],
  },
  {
    displayName: 'Containers',
    children: materialContainerTypeOptions,
  },
];
