/// <reference types="node" />
import tailwind from '@tailwindcss/postcss';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { formatVariant } from '../utils';
import { tailwindConfig } from './tailwind';

describe('Tailwind styling coverage', () => {
  it('labels sizes and spacing without treating column counts as lengths', () => {
    const size = tailwindConfig.className.find(({ name }) => name === 'Size')!;
    expect(size.options[0].variantLabels?.['48']).toBe('48 · 12rem');
    expect(size.options[1].variantLabels?.['0.5']).toBe('0.5 · 0.125rem');
    expect(
      tailwindConfig.fieldGroupClassName[0].options.find(({ name }) => name === 'Columns')
        ?.variantLabels,
    ).toBeUndefined();
  });

  it('generates CSS for every class offered by the panel without application scanning', async () => {
    const source = readFileSync(resolve('libs/core/src/assets/tailwind-styling.css'), 'utf8');
    const result = await postcss([tailwind()]).process(`@import 'tailwindcss/theme';\n${source}`, {
      from: resolve('isolated-styling.css'),
    });
    const selectors = new Set<string>();
    result.root.walkRules((rule) => {
      selectors.add(rule.selector);
    });
    const missing: string[] = [];
    for (const category of [...tailwindConfig.className, ...tailwindConfig.fieldGroupClassName]) {
      for (const option of category.options) {
        for (const breakpoint of tailwindConfig.breakpoints) {
          if (breakpoint.value && !option.hasBreakpoints) {
            continue;
          }
          for (const variant of option.variants) {
            const token = formatVariant(
              variant,
              option,
              breakpoint,
              tailwindConfig.breakpointAffix,
            );
            const selector = `.${token.replace(/[.:/]/g, '\\$&')}`;
            if (!selectors.has(selector)) {
              missing.push(token);
            }
          }
        }
      }
    }
    expect(missing).toEqual([]);
    expect(selectors.has('.grid-cols-12')).toBe(true);
    expect(selectors.has('.sm\\:col-span-12')).toBe(true);
  });
});
