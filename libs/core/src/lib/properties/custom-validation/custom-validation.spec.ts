import { signal } from '@angular/core';
import { CoreFormService } from '../../editor/core-form.service';
import { WorkspaceValidation } from '../../model/types';
import { CoreFieldService } from '../../config/core-field.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';
import { PropertyChangeType } from '../types';
import { FieldCustomValidationProperty } from './custom-validation';
import { createCustomValidationProperty } from './custom-validation.config';

describe('FieldCustomValidationProperty', () => {
  let fixture: ComponentFixture<FieldCustomValidationProperty>;
  const catalog = signal<WorkspaceValidation[]>([]);

  beforeEach(async () => {
    catalog.set([]);
    await TestBed.configureTestingModule({
      imports: [FieldCustomValidationProperty],
      providers: [
        provideNoopAnimations(),
        {
          provide: CoreFormService,
          useValue: { validations: catalog, validationsLoadError: signal(null) },
        },
        {
          provide: CoreFieldService,
          useValue: { validationMessagesPath: ['validation', 'messages'] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldCustomValidationProperty);
    fixture.componentRef.setInput(
      'property',
      createCustomValidationProperty({
        label: 'Custom Validation',
        key: 'validators.validation',
        validationOptions: [{ label: 'IP Address', value: 'ip' }],
      }),
    );
    fixture.componentRef.setInput('path', ['validators', 'validation']);
    fixture.componentRef.setInput('target', {
      validators: { validation: [{ name: 'ip' }] },
      validation: { messages: { ip: 'Invalid IP address' } },
    });
    fixture.detectChanges();
  });

  it('removes a validator without deleting its message', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);

    fixture.componentInstance.onRemoveChild(0);

    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['validators', 'validation'],
      value: [],
    });
    expect(changed).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: ['validation', 'messages', 'ip'] }),
    );
  });

  it.each([[{ name: 'ip' }], ['ip']])(
    'keeps creation available while omitting selected validators: %j',
    (...validation) => {
      fixture.componentRef.setInput('target', { validators: { validation } });
      fixture.detectChanges();
      expect(fixture.componentInstance.addMenuItems().map(({ label }) => label)).toEqual([
        'Create validation',
      ]);
      expect(
        fixture.nativeElement.querySelector('button[aria-label="Add custom validation"]').disabled,
      ).toBe(false);
      expect(
        fixture.nativeElement.querySelector('button[aria-label="Create validation"]'),
      ).toBeNull();
    },
  );

  it('adds the chosen available validator and rejects duplicates', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);
    fixture.componentInstance.addValidation('ip');
    expect(changed).not.toHaveBeenCalled();

    fixture.componentRef.setInput('target', { validators: { validation: [] } });
    const menuItems = fixture.componentInstance.addMenuItems();
    expect(menuItems.map(({ label }) => label)).toEqual(['IP Address', 'Create validation']);
    menuItems[0].command?.({});
    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['validators', 'validation'],
      value: [{ name: 'ip' }],
    });
  });

  it('opens a new expression draft from the picker without changing the field', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);
    fixture.componentInstance
      .addMenuItems()
      .find(({ label }) => label === 'Create validation')
      ?.command?.({});
    expect(fixture.componentInstance.editingName()).toBe('');
    expect(changed).not.toHaveBeenCalled();
  });

  it('renames an expression rule without losing registered validators or options', () => {
    fixture.componentRef.setInput('target', {
      validators: {
        validation: ['ip'],
        oldRule: {
          expression: 'control.value > 0',
          message: 'Enter a positive value.',
          errorPath: 'amount',
        },
        otherRule: { expression: 'true', message: 'Other message' },
      },
    });
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);
    fixture.componentInstance.saveExpression('oldRule', {
      name: 'newRule',
      rule: { expression: 'control.value >= 18', message: 'Enter 18 or more.' },
    });
    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.VALUE,
      path: ['validators'],
      value: {
        validation: ['ip'],
        otherRule: { expression: 'true', message: 'Other message' },
        newRule: {
          expression: 'control.value >= 18',
          message: 'Enter 18 or more.',
          errorPath: 'amount',
        },
      },
    });
  });

  it('removes only the selected expression rule', () => {
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);
    fixture.componentInstance.removeExpression('minimumAge');
    expect(changed).toHaveBeenCalledWith({
      type: PropertyChangeType.CLEAR,
      path: ['validators', 'minimumAge'],
    });
  });

  it('does not offer expression creation for asynchronous validators', () => {
    fixture.componentRef.setInput(
      'property',
      createCustomValidationProperty({
        label: 'Async Validation',
        key: 'asyncValidators.validation',
        validationOptions: [],
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.isSynchronous()).toBe(false);
    expect(fixture.componentInstance.addMenuItems()).toEqual([]);
    expect(fixture.nativeElement.textContent).not.toContain('Create validation');
  });
  it('copies a saved rule without linking it to the catalog', () => {
    catalog.set([
      {
        id: 'saved',
        name: 'adult',
        expression: 'control.value >= 18',
        message: 'Enter 18 or more.',
      },
    ]);
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);
    fixture.componentInstance.addMenuItems().find((item) => item.label === 'adult')!.command!({});
    const value = changed.mock.calls[0][0].value;
    expect(value).toEqual({
      validation: [{ name: 'ip' }],
      adult: { expression: 'control.value >= 18', message: 'Enter 18 or more.' },
    });
    catalog.set([{ ...catalog()[0], expression: 'control.value >= 21' }]);
    expect(value.adult.expression).toBe('control.value >= 18');
    value.adult.message = 'Field copy';
    expect(catalog()[0].message).toBe('Enter 18 or more.');
    catalog.set([]);
    expect(value.adult.expression).toBe('control.value >= 18');
  });

  it('omits saved names conflicting with registered, synchronous, or asynchronous validators', () => {
    catalog.set(
      ['ip', 'existing', 'remote', 'available'].map((name) => ({
        id: name,
        name,
        expression: 'true',
        message: 'Invalid',
      })),
    );
    fixture.componentRef.setInput('target', {
      validators: { existing: { expression: 'true' } },
      asyncValidators: { validation: ['remote'] },
    });
    expect(
      fixture.componentInstance.availableWorkspaceValidations().map((rule) => rule.name),
    ).toEqual(['available']);
    const changed = vi.fn();
    fixture.componentInstance.targetChanged.subscribe(changed);
    fixture.componentInstance.addWorkspaceValidation('existing');
    expect(changed).not.toHaveBeenCalled();
    fixture.componentRef.setInput(
      'property',
      createCustomValidationProperty({
        label: 'Async',
        key: 'asyncValidators.validation',
        validationOptions: [],
      }),
    );
    expect(fixture.componentInstance.availableWorkspaceValidations()).toEqual([]);
  });
});
