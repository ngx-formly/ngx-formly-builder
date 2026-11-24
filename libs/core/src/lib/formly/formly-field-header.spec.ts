import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Menu } from '../ui/menu';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreFieldService } from '../config/core-field.service';
import { CoreFormService } from '../editor/core-form.service';
import { CoreAddFieldOption } from '../editor/types';
import { FieldPresetDialogService } from '../field-preset/field-preset-dialog.service';
import { EditorField, FieldInfo } from '../model/types';
import { FormlyFieldHeader } from './formly-field-header';

const fieldInfo: FieldInfo = {
  childIds: [],
  id: 'field-1',
  name: 'Text Field',
  formId: 'form-1',
  idPath: ['field-1'],
  isRoot: true,
};

const field: EditorField = {
  type: 'input',
  _info: fieldInfo,
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyFieldHeader],
  template: `
    <core-formly-field-header
      fieldLabel="name"
      [field]="field"
      [fieldInfo]="fieldInfo"
      [isMouseInside]="isMouseInside()"
    />
  `,
})
class TestHostComponent {
  readonly field = field;
  readonly fieldInfo = fieldInfo;
  readonly isMouseInside = signal(false);
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('FormlyFieldHeader', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let tieredMenu: Menu;
  let addField: (fieldType: string, fieldId: string) => void;
  let addOptions: CoreAddFieldOption[];

  beforeEach(async () => {
    addField = vi.fn<(fieldType: string, fieldId: string) => void>();
    addOptions = [
      {
        label: 'Text',
        items: [
          {
            label: 'Basic',
            items: [
              {
                label: 'Input',
                command: () => addField('input', fieldInfo.id),
              },
            ],
          },
        ],
      },
    ];

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        FieldPresetDialogService,
        {
          provide: CoreFormService,
          useValue: {
            getAddOptions: () => addOptions,
            getReplaceOptions: () => [],
            getFieldIndex: () => -1,
            activeRootFieldIds: () => [],
          },
        },
        {
          provide: CoreFieldService,
          useValue: {
            getFieldIcon: () => 'text_fields',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    tieredMenu = fixture.debugElement.query(By.directive(Menu)).componentInstance;
  });

  it('renders add options through a tiered menu', () => {
    expect(tieredMenu.model()).toEqual([{ label: 'Add Field', icon: 'add', items: addOptions }]);
    tieredMenu.model()[0].items?.[0].items?.[0].items?.[0].command?.({});
    expect(addField).toHaveBeenCalledWith('input', fieldInfo.id);
  });

  it('keeps the header visible while the options menu is open', () => {
    const element = fixture.debugElement.query(By.directive(FormlyFieldHeader)).nativeElement;
    expect(element.classList.contains('opacity-0')).toBe(true);
    tieredMenu.visible = true;
    fixture.detectChanges();
    expect(element.classList.contains('opacity-0')).toBe(false);
  });

  it('offers horizontal movement and keyboard-accessible exits for a row child', () => {
    const service = TestBed.inject(CoreFormService);
    service.getField = () => ({
      type: 'formly-group',
      fieldGroupClassName: 'formly-builder-row',
      _info: { ...fieldInfo, id: 'row', childIds: ['field-1', 'field-2'] },
    });
    service.getFieldIndex = () => 0;
    service.dropField = vi.fn();
    TestBed.inject(CoreFieldService).getChildIds = (info) => info.childIds;
    const rowChild = TestBed.createComponent(FormlyFieldHeader);
    rowChild.componentRef.setInput('field', field);
    rowChild.componentRef.setInput('fieldLabel', 'name');
    rowChild.componentRef.setInput('fieldInfo', {
      ...fieldInfo,
      isRoot: false,
      idPath: ['row', 'field-1'],
    });
    rowChild.componentRef.setInput('isMouseInside', false);
    const options = rowChild.componentInstance.menuOptions();
    expect(options.map((option) => option.label)).toContain('Move right');
    expect(options.map((option) => option.label)).not.toContain('Move down');
    options.find((option) => option.label === 'Move above row')?.command?.({});
    expect(service.dropField).toHaveBeenCalledWith('row', 'top', { fieldId: 'field-1' });
    options.find((option) => option.label === 'Move below row')?.command?.({});
    expect(service.dropField).toHaveBeenCalledWith('row', 'bottom', { fieldId: 'field-1' });
  });
});
