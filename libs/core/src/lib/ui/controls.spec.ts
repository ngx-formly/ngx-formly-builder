import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from './dialog';
import { Menu } from './menu';
import { Panel } from './panel';
import { Splitter } from './splitter';

@Component({
  imports: [Splitter],
  template: `<core-splitter
    stateKey="test-panels"
    [panelSizes]="[25, 50, 25]"
    [minSizes]="[15, 20, 15]"
  >
    <ng-template #panel>Fields</ng-template><ng-template #panel>Form</ng-template
    ><ng-template #panel>Properties</ng-template>
  </core-splitter>`,
})
class SplitterHost {}

@Component({
  imports: [Dialog],
  template: `<button>Open</button
    ><core-dialog
      header="Edit form"
      [closable]="!saving()"
      [role]="role()"
      [(visible)]="visible"
    >
      <input
        aria-label="Form name"
        value="Draft"
      />
    </core-dialog>`,
})
class DialogHost {
  readonly visible = signal(true);
  readonly saving = signal(false);
  readonly role = signal<'dialog' | 'complementary'>('dialog');
}

@Component({
  imports: [Menu],
  template: `<button (click)="menu.show($event)">Options</button
    ><core-menu
      #menu
      [model]="items"
    />`,
})
class MenuHost {
  readonly selected = vi.fn();
  readonly items = [{ label: 'Add', items: [{ label: 'Text', command: this.selected }] }];
}

@Component({
  imports: [Panel],
  template: `<core-property-panel
    header="Properties"
    toggleable
    ><input value="Draft" />
    <ng-template #icons><button (click)="add()">Add</button></ng-template>
  </core-property-panel>`,
})
class PanelHost {
  readonly add = vi.fn();
}

describe('editor controls', () => {
  afterEach(() => {
    localStorage.removeItem('test-panels');
    vi.restoreAllMocks();
  });

  it('resizes adjacent panels with the keyboard, clamps bounds and restores the saved layout', () => {
    const fixture = TestBed.createComponent(SplitterHost);
    fixture.detectChanges();
    const handle: HTMLElement = fixture.nativeElement.querySelector('[role=separator]');
    const press = (key: string) => {
      handle.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };
    press('ArrowRight');
    expect(handle.getAttribute('aria-valuenow')).toBe('27');
    press('Home');
    expect(handle.getAttribute('aria-valuenow')).toBe('15');
    press('End');
    expect(handle.getAttribute('aria-valuenow')).toBe('55');
    expect(JSON.parse(localStorage.getItem('test-panels')!).panelSizes).toEqual([55, 20, 25]);
    fixture.destroy();
    const restored = TestBed.createComponent(SplitterHost);
    restored.detectChanges();
    expect(
      restored.nativeElement.querySelector('[role=separator]').getAttribute('aria-valuenow'),
    ).toBe('55');
  });

  it.each(['{', '{"panelSizes":[-10,85,25]}', '{"panelSizes":[10,10,10]}'])(
    'ignores malformed saved layout %s',
    (stored) => {
      localStorage.setItem('test-panels', stored);
      const fixture = TestBed.createComponent(SplitterHost);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('[role=separator]').getAttribute('aria-valuenow'),
      ).toBe('25');
    },
  );

  it('keeps resizing usable when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const fixture = TestBed.createComponent(SplitterHost);
    fixture.detectChanges();
    const handle: HTMLElement = fixture.nativeElement.querySelector('[role=separator]');
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(handle.getAttribute('aria-valuenow')).toBe('23');
  });

  it('blocks dialog dismissal while saving and emits the closed state after Escape', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.componentInstance.saving.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const close = overlay.querySelector<HTMLButtonElement>('[aria-label=Close]')!;
    expect(close.disabled).toBe(true);
    close.click();
    expect(fixture.componentInstance.visible()).toBe(true);
    const escape = () =>
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
      );
    escape();
    expect(fixture.componentInstance.visible()).toBe(true);
    fixture.componentInstance.saving.set(false);
    fixture.detectChanges();
    overlay.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    expect(fixture.componentInstance.visible()).toBe(true);
    escape();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(overlay.querySelector('[role=dialog]')).toBeNull();
  });

  it('dismisses the navigation drawer on a backdrop click', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.componentInstance.role.set('complementary');
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    overlay.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(overlay.querySelector('[role=complementary]')).toBeNull();
  });

  it('selects a nested menu command once, closes the menu and restores trigger focus', async () => {
    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    overlay.querySelector<HTMLButtonElement>('[role=menuitem]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const leaf = Array.from(overlay.querySelectorAll<HTMLButtonElement>('[role=menuitem]')).find(
      (item) => item.textContent?.includes('Text'),
    )!;
    leaf.click();
    expect(fixture.componentInstance.selected).toHaveBeenCalledOnce();
    expect(overlay.querySelector('[role=menu]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('preserves property values while collapsed and keeps header actions outside the toggle', () => {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-expanded]');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Edited';
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(input.closest('[hidden]')).not.toBeNull();
    const add = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent === 'Add')!;
    add.click();
    expect(fixture.componentInstance.add).toHaveBeenCalledOnce();
    expect(toggle.contains(add)).toBe(false);
    toggle.click();
    fixture.detectChanges();
    expect(input.value).toBe('Edited');
    expect(input.closest('[hidden]')).toBeNull();
  });
});
