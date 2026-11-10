import { BreakpointAffix, ClassType, StyleOptionCategory, StylesConfig } from '../types';

const numberVariants = [
  '0',
  '0.5',
  '1',
  '1.5',
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '20',
  '24',
  '28',
  '32',
  '36',
  '40',
  '44',
  '48',
  '52',
  '56',
  '60',
  '64',
  '72',
  '80',
  '96',
];

const spacingLabels = Object.fromEntries(
  numberVariants.map((value) => [value, `${value} · ${Number(value) * 0.25}rem`]),
);
const spacingDescription = 'Uses the default 0.25rem spacing unit; host CSS may override it.';

const fractionVariants = [
  '1/2',
  '1/3',
  '2/3',
  '1/4',
  '2/4',
  '3/4',
  '1/5',
  '2/5',
  '3/5',
  '4/5',
  '1/6',
  '2/6',
  '3/6',
  '4/6',
  '5/6',
];
const fractionVariants2 = [
  ...fractionVariants,
  '1/12',
  '2/12',
  '3/12',
  '4/12',
  '5/12',
  '6/12',
  '7/12',
  '8/12',
  '9/12',
  '10/12',
  '11/12',
];

const textVariants = ['px', 'auto'];
const textVariants2 = [...textVariants, 'full', 'screen', 'min', 'max', 'fit'];

const fieldLayout: StyleOptionCategory = {
  name: 'Layout',
  options: [
    {
      name: 'System',
      variants: ['block'],
      spanWidth: true,
      hasBreakpoints: true,
    },
    {
      name: 'Column Start',
      value: 'col-start',
      variants: ['1', '2', '3'],
      hasBreakpoints: true,
      dependsOnParent: {
        type: ClassType.FIELD_GROUP_CLASS_NAME,
        value: 'grid',
      },
    },
    {
      name: 'Column Span',
      value: 'col-span',
      variants: ['1', '2', '3'],
      hasBreakpoints: true,
      dependsOnParent: {
        type: ClassType.FIELD_GROUP_CLASS_NAME,
        value: 'grid',
      },
    },
    {
      name: 'Row Start',
      value: 'row-start',
      variants: ['1', '2', '3'],
      hasBreakpoints: true,
      dependsOnParent: {
        type: ClassType.FIELD_GROUP_CLASS_NAME,
        value: 'grid',
      },
    },
    {
      name: 'Row Span',
      value: 'row-span',
      variants: ['1', '2', '3'],
      hasBreakpoints: true,
      dependsOnParent: {
        type: ClassType.FIELD_GROUP_CLASS_NAME,
        value: 'grid',
      },
    },
  ],
};

const fieldSizing: StyleOptionCategory = {
  name: 'Size',
  options: [
    {
      name: 'Height',
      value: 'h',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...fractionVariants2, ...textVariants2],
    },
    {
      name: 'Width',
      value: 'w',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...fractionVariants2, ...textVariants2],
    },
  ],
};

const fieldMargin: StyleOptionCategory = {
  name: 'Margin',
  options: [
    {
      name: 'General',
      value: 'm',
      spanWidth: true,
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...textVariants],
    },
    {
      name: 'Horizintal',
      value: 'mx',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...textVariants],
    },
    {
      name: 'Vertical',
      value: 'my',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...textVariants],
    },
    {
      name: 'Top',
      value: 'mt',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...textVariants],
    },
    {
      name: 'Bottom',
      value: 'mb',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...textVariants],
    },
    {
      name: 'Left',
      value: 'ml',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...textVariants],
    },
    {
      name: 'Right',
      value: 'mr',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, ...textVariants],
    },
  ],
};

const fieldGroupLayout: StyleOptionCategory = {
  name: 'Layout',
  options: [
    {
      name: 'System',
      variants: ['flex', 'grid', 'block'],
      spanWidth: true,
    },
    {
      name: 'Flex Direction',
      value: 'flex',
      variants: ['col', 'col-reverse', 'row', 'row-reverse'],
      dependsOn: {
        type: ClassType.FIELD_GROUP_CLASS_NAME,
        value: 'flex',
      },
      spanWidth: true,
      hasBreakpoints: true,
    },
    {
      name: 'Columns',
      value: 'grid-cols',
      variants: ['1', '2', '3'],
      dependsOn: {
        type: ClassType.FIELD_GROUP_CLASS_NAME,
        value: 'grid',
      },
      hasBreakpoints: true,
    },
    {
      name: 'Rows',
      value: 'grid-rows',
      variants: ['1', '2', '3'],
      dependsOn: {
        type: ClassType.FIELD_GROUP_CLASS_NAME,
        value: 'grid',
      },
      hasBreakpoints: true,
    },
    {
      name: 'Align Items',
      value: 'items',
      variants: ['start', 'center', 'end'],
    },
    {
      name: 'Justify Content',
      value: 'justify',
      variants: ['start', 'center', 'end', 'around', 'between', 'evenly'],
    },
  ],
};

const fieldGroupGap: StyleOptionCategory = {
  name: 'Gap',
  options: [
    {
      name: 'General',
      value: 'gap',
      spanWidth: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants],
    },
    {
      name: 'Horizontal',
      value: 'gap-x',
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants],
    },
    {
      name: 'Vertical',
      value: 'gap-y',
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants],
    },
  ],
};

const fieldGroupPadding: StyleOptionCategory = {
  name: 'Padding',
  options: [
    {
      name: 'General',
      value: 'p',
      spanWidth: true,
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, 'px'],
    },
    {
      name: 'Horizintal',
      value: 'px',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, 'px'],
    },
    {
      name: 'Vertical',
      value: 'py',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, 'px'],
    },
    {
      name: 'Top',
      value: 'pt',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, 'px'],
    },
    {
      name: 'Bottom',
      value: 'pb',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, 'px'],
    },
    {
      name: 'Left',
      value: 'pl',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, 'px'],
    },
    {
      name: 'Right',
      value: 'pr',
      hasBreakpoints: true,
      variantLabels: spacingLabels,
      description: spacingDescription,
      variants: [...numberVariants, 'px'],
    },
  ],
};

export const tailwindConfig: StylesConfig = {
  label: 'Tailwind',
  breakpointAffix: BreakpointAffix.PREFIX,
  breakpoints: [
    {
      name: 'Default',
      description: 'All devices',
      value: '',
    },
    {
      name: 'SM',
      description: 'Portrait tablets and large phones, 640px and up',
      value: 'sm:',
    },
    {
      name: 'MD',
      description: 'Landscape tablets, 768px and up',
      value: 'md:',
    },
    {
      name: 'LG',
      description: 'Laptops/desktops, 1024px and up',
      value: 'lg:',
    },
    {
      name: 'XL',
      description: 'Large laptops and desktops, 1280px and up',
      value: 'xl:',
    },
  ],
  className: [fieldLayout, fieldSizing, fieldMargin],
  fieldGroupClassName: [fieldGroupLayout, fieldGroupGap, fieldGroupPadding],
};
