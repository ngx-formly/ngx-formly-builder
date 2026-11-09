import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreFormService } from '../../editor/core-form.service';
import { CoreLibraryService } from '../../config/core-library.service';
import { CORE_FORM_TEMPLATES, FormTemplate } from '../../config/types';
import { CreateFormDialogService } from './create-form-dialog.service';
import { CreateFormDialog } from './create-form-dialog';
import { FormStoreRecoveryRequiredError } from '../../persistence/types';

function getForm(component: CreateFormDialog): NgForm {
  return (component as unknown as { form: () => NgForm }).form();
}

describe('CreateFormDialog', () => {
  let fixture: ComponentFixture<CreateFormDialog>;
  let addForm$: ReturnType<typeof vi.fn>;
  let isOpen: ReturnType<typeof signal<boolean>>;
  let parentId: ReturnType<typeof signal<string | null>>;
  let hasStorageRecoveryIssues: ReturnType<typeof signal<boolean>>;
  let validateSchema: ReturnType<typeof vi.fn>;

  const templateA = {
    name: 'Material Showcase',
    libraryId: 'form-material',
    icon: 'contact_mail',
    description: 'Standard inquiry form.',
    fields: [{ key: 'name', type: 'input' }],
    model: { name: 'Jane' },
  };

  const templateB = {
    name: 'Material Draft',
    libraryId: 'form-material',
    icon: 'person_add',
    fields: [{ key: 'email', type: 'input' }],
    model: {},
  };

  const templateZorro = {
    name: 'Ng Zorro Showcase',
    libraryId: 'form-ng-zorro',
    icon: 'dashboard',
    description: 'Ng Zorro controls.',
    fields: [{ key: 'name', type: 'input' }],
    model: { name: 'Jane' },
  };

  function openDialog(): void {
    isOpen.set(true);
    fixture.detectChanges();
  }

  function setName(name: string): void {
    const nameInput = fixture.nativeElement.querySelector('#create-form-name') as HTMLInputElement;
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));
    nameInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  function createFromTemplate(templateId: string): void {
    const button = fixture.nativeElement.querySelector(
      `button[id="template-${templateId}"]`,
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }

  function fileDrag(
    type: string,
    files: File[] = [],
    relatedTarget: Node | null = null,
    types = ['Files'],
  ): Event {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      dataTransfer: { value: { types, files, dropEffect: 'none' } },
      relatedTarget: { value: relatedTarget },
    });
    fixture.nativeElement.querySelector('#template-blank').dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  function selectFiles(files: File[]): void {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { configurable: true, value: files });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  async function setup(sharedTemplates?: FormTemplate[]) {
    addForm$ = vi.fn(() => of(undefined));
    isOpen = signal(false);
    parentId = signal(null);
    hasStorageRecoveryIssues = signal(false);
    validateSchema = vi.fn(() => ({ success: true }));

    TestBed.resetTestingModule();
    TestBed.overrideComponent(CreateFormDialog, {
      set: {
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    await TestBed.configureTestingModule({
      imports: [CreateFormDialog],
      providers: [
        provideNoopAnimations(),
        { provide: CORE_FORM_TEMPLATES, useValue: sharedTemplates },
        {
          provide: CoreFormService,
          useValue: {
            addForm$,
            hasStorageRecoveryIssues,
          },
        },
        {
          provide: CoreLibraryService,
          useValue: {
            libraryOptions: [
              { id: 'form-material', label: 'Material' },
              { id: 'form-ng-zorro', label: 'Ng Zorro' },
            ],
            formTemplates: [templateA, templateB, templateZorro],
            getLibrary: () => ({
              enableFormUploadSchema: true,
              schema: { safeParse: validateSchema },
            }),
          },
        },
        {
          provide: CreateFormDialogService,
          useValue: {
            open: vi.fn(),
            close: vi.fn(),
            isOpen,
            parentId,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFormDialog);
    fixture.autoDetectChanges();
  }

  beforeEach(() => setup());
  afterEach(() => vi.restoreAllMocks());

  it('shows the primary border and download icon only while files are dragged over the card', async () => {
    openDialog();
    await fixture.whenStable();
    const card = fixture.nativeElement.querySelector('#template-blank') as HTMLButtonElement;
    expect(fileDrag('dragover', [], null, ['text/plain']).defaultPrevented).toBe(false);
    expect(card.querySelector('i')?.textContent?.trim()).toBe('draft');

    expect(fileDrag('dragenter').defaultPrevented).toBe(true);
    expect(fileDrag('dragover').defaultPrevented).toBe(true);
    expect(card.classList.contains('border-primary')).toBe(true);
    expect(card.classList.contains('border-surface')).toBe(false);
    expect(card.querySelector('i')?.textContent?.trim()).toBe('download');
    fileDrag('dragleave', [], card.querySelector('span'));
    expect(card.querySelector('i')?.textContent?.trim()).toBe('download');
    fileDrag('dragleave');
    expect(card.classList.contains('border-primary')).toBe(false);
    expect(card.classList.contains('border-surface')).toBe(true);
    expect(card.querySelector('i')?.textContent?.trim()).toBe('draft');
    expect(addForm$).not.toHaveBeenCalled();
  });

  it('opens the file picker without creating a blank form and ignores cancellation', async () => {
    openDialog();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);
    fixture.nativeElement.querySelector('[aria-label="Import form file"]').click();

    expect(click).toHaveBeenCalledOnce();
    expect(input.accept).toBe('.json,.txt');
    expect(input.multiple).toBe(false);
    selectFiles([]);
    expect(addForm$).not.toHaveBeenCalled();
    expect(TestBed.inject(CreateFormDialogService).close).not.toHaveBeenCalled();
  });

  it.each([
    ['drop', null],
    ['drop', 'form-material'],
    ['picker', null],
    ['picker', 'form-material'],
  ])(
    'imports a file through %s with library %s and the selected folder',
    async (source, libraryId) => {
      parentId.set('folder-1');
      openDialog();
      fixture.componentInstance.selectedLibrary.set(libraryId);
      setName('  Imported form  ');
      await fixture.whenStable();
      const files = [new File(['[{"key":"name","type":"input"}]'], 'form.json')];
      if (source === 'drop') {
        fileDrag('dragenter');
        expect(fileDrag('drop', files).defaultPrevented).toBe(true);
      } else {
        selectFiles(files);
      }

      expect(fixture.nativeElement.querySelector('#template-blank i').textContent.trim()).toBe(
        'draft',
      );
      await vi.waitFor(() =>
        expect(addForm$).toHaveBeenCalledExactlyOnceWith(
          'Imported form',
          [{ key: 'name', type: 'input' }],
          {},
          libraryId ?? 'form-vanilla',
          true,
          'folder-1',
        ),
      );
      expect(validateSchema).toHaveBeenCalledWith([{ key: 'name', type: 'input' }]);
      expect(TestBed.inject(CreateFormDialogService).close).toHaveBeenCalledOnce();
    },
  );

  it('uses the filename when no name is entered', async () => {
    openDialog();
    await fixture.whenStable();
    fileDrag('drop', [new File(['[]'], 'Contact Form.TXT')]);
    await vi.waitFor(() =>
      expect(addForm$).toHaveBeenCalledExactlyOnceWith(
        'Contact Form',
        [],
        {},
        'form-vanilla',
        true,
        null,
      ),
    );
  });

  it.each(['{', '{}', '[null]', '["input"]', '[[]]'])(
    'rejects invalid form contents %s without saving',
    async (content) => {
      openDialog();
      await fixture.whenStable();
      fileDrag('drop', [new File([content], 'invalid.json')]);
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('p-message')).toBeTruthy();
      });
      expect(addForm$).not.toHaveBeenCalled();
      expect(TestBed.inject(CreateFormDialogService).close).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('#template-blank').disabled).toBe(false);
    },
  );

  it('rejects files that do not match the selected library schema', async () => {
    openDialog();
    validateSchema.mockReturnValue({ success: false });
    await fixture.whenStable();
    fileDrag('drop', [new File(['[{"type":"unknown"}]'], 'form.json')]);
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('does not match the selected UI library');
    });
    expect(addForm$).not.toHaveBeenCalled();
  });

  it('rejects unsupported files and multiple files', async () => {
    openDialog();
    await fixture.whenStable();
    for (const files of [
      [new File(['[]'], 'image.png')],
      [new File(['[]'], 'one.json'), new File(['[]'], 'two.json')],
    ]) {
      fileDrag('drop', files);
      expect(fixture.nativeElement.textContent).toContain(
        'Choose or drop one JSON or TXT form file at a time.',
      );
    }
    expect(addForm$).not.toHaveBeenCalled();
  });

  it('handles file read errors and allows retrying', async () => {
    const read = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (
      this: FileReader,
    ) {
      this.dispatchEvent(new ProgressEvent('error'));
    });
    openDialog();
    await fixture.whenStable();
    fileDrag('drop', [new File(['[]'], 'form.json')]);
    expect(fixture.nativeElement.textContent).toContain(
      'Could not read the file. Please try again.',
    );
    expect(fixture.nativeElement.querySelector('#template-blank').disabled).toBe(false);
    expect(addForm$).not.toHaveBeenCalled();
    read.mockRestore();
    fileDrag('drop', [new File(['[]'], 'form.json')]);
    await vi.waitFor(() => expect(addForm$).toHaveBeenCalledOnce());
  });

  it('ignores drops while saving or when storage recovery is required', async () => {
    openDialog();
    await fixture.whenStable();
    hasStorageRecoveryIssues.set(true);
    expect(fileDrag('dragover').defaultPrevented).toBe(false);
    fileDrag('drop', [new File(['[]'], 'form.json')]);
    expect(addForm$).not.toHaveBeenCalled();
    hasStorageRecoveryIssues.set(false);
    const saved = new Subject<void>();
    addForm$.mockReturnValue(saved);
    fixture.componentInstance.createForm();
    expect(fileDrag('dragover').defaultPrevented).toBe(false);
    fileDrag('drop', [new File(['[]'], 'form.json')]);
    expect(addForm$).toHaveBeenCalledOnce();
    saved.complete();
  });

  it('cancels a pending file read when the dialog is closed', async () => {
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(() => undefined);
    const abort = vi.spyOn(FileReader.prototype, 'abort');
    openDialog();
    await fixture.whenStable();
    fileDrag('drop', [new File(['[]'], 'form.json')]);
    expect(fixture.nativeElement.querySelector('#template-blank').disabled).toBe(true);
    fileDrag('drop', [new File(['[]'], 'second.json')]);
    expect(FileReader.prototype.readAsText).toHaveBeenCalledOnce();
    isOpen.set(false);
    fixture.detectChanges();
    expect(abort).toHaveBeenCalledOnce();
    openDialog();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#template-blank').disabled).toBe(false);
    expect(addForm$).not.toHaveBeenCalled();
  });

  it.each([null, 'form-material', 'form-ng-zorro'])(
    'creates a shared example immediately with the entered name and library %s',
    async (libraryId) => {
      const sharedTemplate: FormTemplate = {
        id: 'starter',
        name: 'Starter Form',
        fields: templateA.fields,
        model: templateA.model,
      };
      await setup([sharedTemplate]);
      openDialog();
      setName('  Chosen name  ');
      fixture.componentInstance.selectedLibrary.set(libraryId);
      await fixture.whenStable();
      createFromTemplate('starter');

      expect(addForm$).toHaveBeenCalledExactlyOnceWith(
        'Chosen name',
        sharedTemplate.fields,
        sharedTemplate.model,
        libraryId ?? 'form-vanilla',
        true,
        null,
      );
      expect(TestBed.inject(CreateFormDialogService).close).toHaveBeenCalledOnce();
      expect(fixture.nativeElement.querySelector('.p-dialog-footer')).toBeNull();
      isOpen.set(false);
      fixture.componentInstance.createForm('starter');
      expect(addForm$).toHaveBeenCalledOnce();
    },
  );

  it('resets the name and library when reopened', () => {
    openDialog();
    setName('Custom');
    fixture.componentInstance.selectedLibrary.set('form-material');
    isOpen.set(false);
    fixture.detectChanges();
    openDialog();

    const nameInput = fixture.nativeElement.querySelector('#create-form-name') as HTMLInputElement;
    expect(nameInput.value).toBe('');
    expect(fixture.componentInstance.selectedLibrary()).toBeNull();
    expect(addForm$).not.toHaveBeenCalled();
  });

  it('lists blank and Quick Start actions without library badges', () => {
    openDialog();
    const actions = fixture.nativeElement.querySelectorAll('form button');
    expect(
      Array.from(actions as NodeListOf<HTMLButtonElement>, (button) =>
        button.getAttribute('aria-label'),
      ),
    ).toEqual([
      'Start with a blank form',
      'Import form file',
      'Material Showcase',
      'Material Draft',
      'Ng Zorro Showcase',
    ]);
    expect(fixture.nativeElement.querySelector('#quick-start-heading').textContent).toContain(
      'Quick Start',
    );
    expect(fixture.nativeElement.querySelector('form').textContent).not.toContain('•');
  });

  it('creates a blank form without an empty Quick Start panel when no examples are configured', async () => {
    await setup([]);
    openDialog();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('#quick-start-heading')).toBeNull();
    createFromTemplate('blank');
    expect(addForm$).toHaveBeenCalledExactlyOnceWith(
      'New form',
      [],
      {},
      'form-vanilla',
      true,
      null,
    );
  });

  it.each(['', '   '])('defaults a blank form name when the name is %j', async (name) => {
    openDialog();
    setName(name);
    await fixture.whenStable();
    const actions = fixture.nativeElement.querySelectorAll(
      'form button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(Array.from(actions).every((button) => !button.disabled)).toBe(true);
    expect(getForm(fixture.componentInstance).valid).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain('Name is required.');
    createFromTemplate('blank');
    expect(addForm$).toHaveBeenCalledExactlyOnceWith(
      'New form',
      [],
      {},
      'form-vanilla',
      true,
      null,
    );
  });

  it.each(['', '   '])('uses the Quick Start title when the name is %j', async (name) => {
    const template: FormTemplate = {
      id: 'expense-report',
      name: 'Expense Report',
      fields: templateA.fields,
      model: templateA.model,
    };
    await setup([template]);
    openDialog();
    setName(name);
    await fixture.whenStable();
    createFromTemplate('expense-report');

    expect(addForm$).toHaveBeenCalledExactlyOnceWith(
      'Expense Report',
      template.fields,
      template.model,
      'form-vanilla',
      true,
      null,
    );
  });

  it('creates a blank vanilla form without selecting a library and keeps its parent', async () => {
    parentId.set('folder-1');
    openDialog();
    setName('  Blankie  ');
    await fixture.whenStable();
    expect(getForm(fixture.componentInstance).valid).toBe(true);
    fixture.componentInstance.createForm();

    expect(addForm$).toHaveBeenCalledWith('Blankie', [], {}, 'form-vanilla', true, 'folder-1');
  });

  it('returns to vanilla when a library selection is cleared', async () => {
    openDialog();
    fixture.componentInstance.selectedLibrary.set('form-material');
    await fixture.whenStable();
    fixture.componentInstance.selectedLibrary.set(null);
    await fixture.whenStable();

    expect(getForm(fixture.componentInstance).valid).toBe(true);
    fixture.componentInstance.createForm();
    expect(addForm$).toHaveBeenCalledWith('New form', [], {}, 'form-vanilla', true, null);
  });

  it('disables creation and explains recovery when corruption is detected in an open dialog', async () => {
    openDialog();
    hasStorageRecoveryIssues.set(true);
    await fixture.whenStable();

    const createButton = fixture.nativeElement.querySelector(
      '#template-blank',
    ) as HTMLButtonElement;
    expect(createButton.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Import form file"]').disabled).toBe(
      true,
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Recover saved data in the Workspace panel',
    );
    fixture.componentInstance.createForm();
    expect(addForm$).not.toHaveBeenCalled();
  });

  it('keeps the entered form and shows a recovery error when a write discovers corruption', async () => {
    openDialog();
    setName('My draft');
    addForm$.mockReturnValue(throwError(() => new FormStoreRecoveryRequiredError([])));

    fixture.componentInstance.createForm();
    await fixture.whenStable();

    expect(TestBed.inject(CreateFormDialogService).close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.formName()).toBe('My draft');
    expect(fixture.nativeElement.textContent).toContain(
      'Recover saved data in the Workspace panel',
    );
  });

  it('handles a synchronous storage failure and allows retrying', async () => {
    openDialog();
    addForm$.mockImplementationOnce(() => {
      throw new Error('private storage failure');
    });

    fixture.componentInstance.createForm();
    await fixture.whenStable();

    expect(TestBed.inject(CreateFormDialogService).close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Could not create the form. Please try again.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('private storage failure');

    fixture.componentInstance.createForm();
    expect(TestBed.inject(CreateFormDialogService).close).toHaveBeenCalledOnce();
  });

  it('disables all creation actions until storage completes and ignores duplicate requests', async () => {
    openDialog();
    const saved = new Subject<void>();
    addForm$.mockReturnValue(saved);

    fixture.componentInstance.createForm();

    await fixture.whenStable();
    const actions = fixture.nativeElement.querySelectorAll(
      'form button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(Array.from(actions).every((button) => button.disabled)).toBe(true);
    expect(TestBed.inject(CreateFormDialogService).close).not.toHaveBeenCalled();
    fixture.componentInstance.createForm('Material Showcase-form-material');
    expect(addForm$).toHaveBeenCalledOnce();
    saved.next();
    saved.complete();
    expect(TestBed.inject(CreateFormDialogService).close).toHaveBeenCalledOnce();
  });

  it('creates a blank form with the selected Ng Zorro library', () => {
    openDialog();
    fixture.componentInstance.selectedLibrary.set('form-ng-zorro');
    setName('Zorro Blankie');
    fixture.componentInstance.createForm();

    expect(addForm$).toHaveBeenCalledWith('Zorro Blankie', [], {}, 'form-ng-zorro', true, null);
  });

  it('creates a form from selected template using template metadata', () => {
    parentId.set(null);
    openDialog();
    setName('Support');
    createFromTemplate('Material Showcase-form-material');

    expect(addForm$).toHaveBeenCalledWith(
      'Support',
      templateA.fields,
      templateA.model,
      templateA.libraryId,
      true,
      null,
    );
  });
});
