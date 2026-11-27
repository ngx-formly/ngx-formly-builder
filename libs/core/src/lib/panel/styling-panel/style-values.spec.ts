import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CoreFormService } from '../../editor/core-form.service';
import { provideFormlyBuilder } from '../../provider';
import { tailwindConfig } from './config/tailwind';
import { applyStyleValues, defaultStyleValues } from './style-values';
import { StylesConfig } from './types';

const options = (styles: StylesConfig) =>
  [...styles.className, ...styles.fieldGroupClassName].flatMap((category) => category.options);
const option = (styles: StylesConfig, value: string) =>
  options(styles).find((o) => o.value === value)!;

describe('style values', () => {
  it('tags the Tailwind size, margin and padding options', () => {
    const tagged = (list: string) =>
      options(tailwindConfig)
        .filter((o) => o.valueList === list)
        .map((o) => o.value);

    expect(tagged('height')).toEqual(['h']);
    expect(tagged('width')).toEqual(['w']);
    expect(tagged('margin')).toEqual(['m', 'mx', 'my', 'mt', 'mb', 'ml', 'mr']);
    expect(tagged('padding')).toEqual(['p', 'px', 'py', 'pt', 'pb', 'pl', 'pr']);
  });

  it('applies a list to every option tagged with it', () => {
    const styles = applyStyleValues(tailwindConfig, {
      margin: [{ value: '4', label: 'Small' }, { value: 'auto' }],
    });

    for (const value of ['m', 'mx', 'my', 'mt', 'mb', 'ml', 'mr']) {
      expect(option(styles, value).variants).toEqual(['4', 'auto']);
      expect(option(styles, value).variantLabels).toEqual({ '4': 'Small' });
    }
  });

  it('shows the value when a label is empty', () => {
    const styles = applyStyleValues(tailwindConfig, { margin: [{ value: '4', label: '' }] });
    expect(option(styles, 'm').variantLabels).toEqual({});
  });

  it('leaves untagged options and lists not given unchanged', () => {
    const styles = applyStyleValues(tailwindConfig, { margin: [] });

    expect(option(styles, 'm').variants).toEqual([]);
    expect(option(styles, 'p')).toBe(option(tailwindConfig, 'p'));
    expect(option(styles, 'gap')).toBe(option(tailwindConfig, 'gap'));
    expect(applyStyleValues(tailwindConfig, {})).toBe(tailwindConfig);
  });

  it('does not change the given config', () => {
    const before = JSON.stringify(tailwindConfig);
    applyStyleValues(tailwindConfig, { height: [{ value: '4' }] });
    expect(JSON.stringify(tailwindConfig)).toBe(before);
  });

  it('reads the starting lists from the first tagged option', () => {
    const defaults = defaultStyleValues(tailwindConfig);
    const margin = option(tailwindConfig, 'm');

    expect(Object.keys(defaults)).toEqual(['height', 'width', 'margin', 'padding']);
    expect(defaults.margin!.map((entry) => entry.value)).toEqual(margin.variants);
    expect(defaults.margin![0]).toEqual({ value: '0', label: '0 · 0rem' });
    expect(defaults.margin!.find((entry) => entry.value === 'auto')).toEqual({ value: 'auto' });
    expect(applyStyleValues(tailwindConfig, defaults)).toEqual(tailwindConfig);
  });

  it('offers no list for a config without tagged options', () => {
    expect(
      defaultStyleValues({ ...tailwindConfig, className: [], fieldGroupClassName: [] }),
    ).toEqual({});
  });
});

describe('CoreFormService.styles', () => {
  beforeEach(() => localStorage.clear());

  it('follows the host lists and later settings updates', () => {
    TestBed.configureTestingModule({
      providers: [provideFormlyBuilder({ styleValues: { height: [{ value: '8' }] } })],
    });
    const forms = TestBed.inject(CoreFormService);
    expect(option(forms.styles(), 'h').variants).toEqual(['8']);
    expect(option(forms.styles(), 'm')).toBe(option(tailwindConfig, 'm'));

    forms
      .updateSettings$({ ...forms.settings(), styleValues: { margin: [{ value: '2' }] } })
      .subscribe();
    expect(option(forms.styles(), 'h').variants).toEqual(['8']);
    expect(option(forms.styles(), 'm').variants).toEqual(['2']);
  });

  it('uses the host styles config without lists', () => {
    TestBed.configureTestingModule({ providers: [provideFormlyBuilder()] });
    expect(TestBed.inject(CoreFormService).styles()).toBe(tailwindConfig);
  });
});
