import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideFormlyCore } from '@ngx-formly/core';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreFormService } from '../../editor/core-form.service';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import { ValidationsTabContent } from './validations-tab-content';
import { WorkspaceValidation } from '../../model/types';

const rule: WorkspaceValidation = {
  id: 'adult',
  name: 'adult',
  expression: 'control.value >= 18',
  message: 'Enter 18 or more.',
};

describe('ValidationsTabContent', () => {
  const forms = {
    validationStorageAvailable: true,
    validations: signal<WorkspaceValidation[]>([]),
    validationsLoading: signal(false),
    validationsLoadError: signal<string | null>(null),
    validationRecoveryIssues: signal([]),
    saveValidation$: vi.fn(),
    deleteValidation$: vi.fn(),
    resetValidations$: vi.fn(),
  };
  beforeEach(() => {
    forms.validationStorageAvailable = true;
    forms.validations.set([rule]);
    forms.validationsLoading.set(false);
    forms.validationsLoadError.set(null);
    forms.saveValidation$.mockReset().mockReturnValue(of(undefined));
    forms.deleteValidation$.mockReset().mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      imports: [ValidationsTabContent],
      providers: [
        provideNoopAnimations(),
        provideFormlyCore(),
        MouseInsideService,
        { provide: CoreFormService, useValue: forms },
      ],
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('filters rules and shows the no-results state', () => {
    const fixture = TestBed.createComponent(ValidationsTabContent);
    fixture.componentInstance.filterValue.set('unknown');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No validations found');
    fixture.componentInstance.filterValue.set('ADULT');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Edit validation adult"]'),
    ).toBeTruthy();
  });

  it('keeps a failed dialog draft, prevents concurrent saves and closes after success', async () => {
    const fixture = TestBed.createComponent(ValidationsTabContent);
    const component = fixture.componentInstance;
    component.open(rule);
    fixture.detectChanges();
    await fixture.whenStable();
    const name = document.querySelector<HTMLInputElement>('input[id$="-name"]')!;
    name.value = 'renamed';
    name.dispatchEvent(new Event('input'));
    forms.saveValidation$.mockReturnValueOnce(throwError(() => new Error('Storage full')));
    component.save({ name: 'renamed', rule });
    fixture.detectChanges();
    expect(component.editing()).toBe(rule);
    expect(component.error()).toContain('Could not save');
    expect(name.value).toBe('renamed');
    const pending = new Subject<void>();
    forms.saveValidation$.mockReturnValueOnce(pending);
    component.save({ name: 'renamed', rule });
    component.save({ name: 'renamed', rule });
    component.close();
    expect(forms.saveValidation$).toHaveBeenCalledTimes(2);
    expect(component.editing()).toBe(rule);
    pending.next();
    pending.complete();
    expect(component.editing()).toBeNull();
  });

  it('confirms deletion and reports a failure without removing the displayed rule', () => {
    const fixture = TestBed.createComponent(ValidationsTabContent);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.componentInstance.remove(rule);
    expect(forms.deleteValidation$).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    forms.deleteValidation$.mockReturnValue(throwError(() => new Error('Offline')));
    fixture.componentInstance.remove(rule);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Could not delete');
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Edit validation adult"]'),
    ).toBeTruthy();
  });

  it('explains unsupported storage without offering catalog actions', () => {
    forms.validationStorageAvailable = false;
    const fixture = TestBed.createComponent(ValidationsTabContent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Saved validations unavailable');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('selects rules without editing and keeps selection across filtering', () => {
    const fixture = TestBed.createComponent(ValidationsTabContent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const select: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Select validation adult"]',
    );
    select.click();
    fixture.detectChanges();
    expect(component.editing()).toBeNull();
    expect(select.getAttribute('aria-pressed')).toBe('true');
    component.filterValue.set('unknown');
    fixture.detectChanges();
    expect(component.selectedIds()).toEqual(['adult']);
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Delete selected validations (1)"]'),
    ).toBeTruthy();
    component.filterValue.set('');
    fixture.detectChanges();
    forms.validationsLoading.set(true);
    component.toggleSelection(rule.id);
    expect(component.selectedIds()).toEqual(['adult']);
    forms.validationsLoading.set(false);
    component.toggleSelection(rule.id);
    expect(component.selectedIds()).toEqual([]);
  });

  it('confirms bulk deletion, deletes sequentially and keeps failed rules selected', () => {
    const other = { ...rule, id: 'other', name: 'other' };
    forms.validations.set([rule, other]);
    const fixture = TestBed.createComponent(ValidationsTabContent);
    const component = fixture.componentInstance;
    component.toggleSelection(rule.id);
    component.toggleSelection(other.id);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.removeSelected();
    expect(forms.deleteValidation$).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    const pending = new Subject<void>();
    forms.deleteValidation$.mockReturnValueOnce(pending);
    forms.deleteValidation$.mockReturnValueOnce(throwError(() => new Error('Offline')));
    component.removeSelected();
    component.removeSelected();
    expect(forms.deleteValidation$.mock.calls).toEqual([['adult']]);
    expect(component.busy()).toBe(true);
    forms.validations.set([other]);
    pending.next();
    pending.complete();
    expect(forms.deleteValidation$.mock.calls).toEqual([['adult'], ['other']]);
    expect(component.busy()).toBe(false);
    expect(component.error()).toContain('Could not delete all');
    expect(component.selectedIds()).toEqual(['other']);

    component.removeSelected();
    forms.validations.set([]);
    expect(component.selectedIds()).toEqual([]);
    expect(component.error()).toBe('');
  });
});
