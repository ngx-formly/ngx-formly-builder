import { palette } from '@primeuix/themes';
import { Preset } from '@primeuix/themes/types';

// Neutral colors from formly.dev, shared by both color schemes.
const surface = {
  0: '#ffffff',
  50: '#f7f5f9',
  100: '#f3eff6',
  200: '#dedbe2',
  300: '#d2ccd7',
  400: '#b8b0c0',
  500: '#918795',
  600: '#625d68',
  700: '#3c3642',
  800: '#1b181f',
  900: '#18161b',
  950: '#111014',
};

export const primengPreset: Preset = {
  semantic: {
    primary: palette('#a52364'),
    colorScheme: {
      light: {
        surface: { ...surface, 500: '#625d68' },
        primary: {
          color: '#a52364',
          contrastColor: '#ffffff',
        },
        highlight: {
          background: '#f6e7ef',
          focusBackground: '{primary.100}',
          color: '{primary.color}',
          focusColor: '{primary.hover.color}',
        },
        text: {
          color: '{surface.900}',
          hoverColor: '{surface.950}',
          mutedColor: '#625d68',
          hoverMutedColor: '{surface.700}',
        },
        content: {
          hoverBackground: '{surface.50}',
        },
        formField: {
          borderColor: '#918795',
          hoverBorderColor: '{surface.600}',
          color: '{text.color}',
          placeholderColor: '{text.muted.color}',
        },
      },
      dark: {
        surface: { ...surface, 500: '#a69aaf' },
        primary: {
          color: '#f5b6dc',
          contrastColor: '#271520',
          hoverColor: '#ffd4ed',
          activeColor: '#f6e7ef',
        },
        highlight: {
          background: '#34212f',
          focusBackground: '#4a2c40',
          color: '{primary.color}',
          focusColor: '{primary.hover.color}',
        },
        text: {
          color: '{surface.100}',
          hoverColor: '{surface.0}',
          mutedColor: '{surface.400}',
          hoverMutedColor: '{surface.300}',
        },
        content: {
          background: '{surface.950}',
        },
        formField: {
          borderColor: '{surface.500}',
          hoverBorderColor: '{surface.400}',
          color: '{text.color}',
          placeholderColor: '{text.muted.color}',
        },
      },
    },
  },
  components: {
    splitter: {
      root: {
        borderColor: 'none',
      },
    },
    divider: {
      horizontal: {
        margin: '0',
      },
      vertical: {
        margin: '0',
      },
    },
    tree: {
      root: {
        padding: '0',
        indent: '12px',
      },
      node: {
        padding: '0.25rem',
      },
    },
    panel: {
      toggleableHeader: {
        padding: '0.5rem',
      },
      content: {
        padding: '0 0.5rem 0.5rem 0.5rem',
      },
    },
    inplace: {
      root: {
        padding: '0.25rem 0.5rem',
      },
    },
    menu: {
      item: {
        padding: '0.75rem',
      },
    },
    message: {
      colorScheme: {
        dark: {
          error: {
            background:
              'color-mix(in srgb,color-mix(in srgb,{red.900} 20%,{surface.900}),transparent 20%);',
          },
          success: {
            background:
              'color-mix(in srgb,color-mix(in srgb,{green.900} 20%,{surface.900}),transparent 20%);',
          },
        },
      },
    },
  },
};
