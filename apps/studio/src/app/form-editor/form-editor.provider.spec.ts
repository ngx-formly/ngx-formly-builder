import { TestBed } from '@angular/core/testing';
import { CoreFieldService, CoreLibraryService } from '@ngx-formly/builder';
import { describe, expect, it } from 'vitest';
import { provideFormEditor } from './form-editor.provider';

describe('provideFormEditor', () => {
  it('offers one complete Material library for new and existing forms', () => {
    TestBed.configureTestingModule({ providers: [provideFormEditor()] });
    const libraries = TestBed.inject(CoreLibraryService);

    expect(libraries.libraryOptions).toEqual([
      { id: 'form-material', label: 'Material' },
      { id: 'form-ng-zorro', label: 'Ng Zorro' },
      { id: 'form-bootstrap', label: 'Bootstrap' },
    ]);
    const material = libraries.getLibrary('form-material');
    const legacyMaterial = libraries.getLibrary('form-studio-material');
    expect(legacyMaterial?.configOptions).toBe(material?.configOptions);
    expect(legacyMaterial?.hidden).toBe(true);
    expect(material?.hidden).not.toBe(true);
    expect(
      material?.fieldCategoryOptions.flatMap(({ children }) => children.map(({ name }) => name)),
    ).toEqual(expect.arrayContaining(['input', 'postal-code', 'card', 'tabs', 'stepper']));
  });

  it.each(['form-material', 'form-studio-material'])(
    'retains saved presets for %s',
    (libraryId) => {
      const preset = {
        id: 'saved-email',
        displayName: 'Saved email',
        field: { type: 'input', key: 'email' },
        isRemovable: true,
      };
      const storageKey = `formly-studio-presets-${libraryId}`;
      localStorage.setItem(storageKey, JSON.stringify({ input: [preset] }));
      TestBed.configureTestingModule({ providers: [provideFormEditor()] });
      const fields = TestBed.inject(CoreFieldService);
      TestBed.inject(CoreLibraryService).setActiveLibrary(libraryId);
      TestBed.tick();

      expect(fields.fieldCategoryPresets().flatMap(({ children }) => children)).toContainEqual(
        expect.objectContaining(preset),
      );
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({ input: [preset] });
    },
  );
});
