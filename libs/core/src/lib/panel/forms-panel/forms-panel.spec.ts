import { CoreFormService } from '../../editor/core-form.service';
import { computed, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Empty } from '../../empty/empty';
import { CreateFormDialogService } from './create-form-dialog.service';
import { ImportDialogService } from './import-dialog.service';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import type { BaseEditorForm, WorkspaceNode } from '../../model/types';
import type { FormStoreRecoveryIssue } from '../../persistence/types';
import { Tooltip } from '../../shared';
import { FormsPanel } from './forms-panel';
import { PanelService } from '../../editor/panel.service';
import { WorkspaceToolbar } from './workspace-toolbar';

describe('FormsPanel', () => {
  let fixture: ComponentFixture<FormsPanel>;
  let createFolder: ReturnType<typeof vi.fn>;
  let openCreateFormDialog: ReturnType<typeof vi.fn>;
  let openImportDialog: ReturnType<typeof vi.fn>;
  let deleteWorkspaceNode: ReturnType<typeof vi.fn>;
  const formList = signal<BaseEditorForm[]>([]);
  const hierarchyRootNodeIds = signal<string[]>([]);
  const hierarchyNodeMap = signal<Record<string, WorkspaceNode>>({});
  const storageRecoveryIssues = signal<readonly FormStoreRecoveryIssue[]>([]);
  const hasStorageRecoveryIssues = computed(() => storageRecoveryIssues().length > 0);
  let resetCorruptedStorage: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    formList.set([]);
    hierarchyRootNodeIds.set([]);
    hierarchyNodeMap.set({});
    storageRecoveryIssues.set([]);
    createFolder = vi.fn();
    resetCorruptedStorage = vi.fn();
    openCreateFormDialog = vi.fn();
    openImportDialog = vi.fn();
    deleteWorkspaceNode = vi.fn();

    TestBed.resetTestingModule();
    TestBed.overrideComponent(FormsPanel, {
      set: {
        imports: [
          Empty,
          ButtonDirective,
          ButtonIcon,
          ButtonLabel,
          ButtonGroup,
          Tooltip,
          WorkspaceToolbar,
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          MouseInsideService,
          {
            provide: CreateFormDialogService,
            useValue: {
              open: openCreateFormDialog,
              close: vi.fn(),
              isOpen: signal(false),
              parentId: signal(null),
            },
          },
          {
            provide: ImportDialogService,
            useValue: { open: openImportDialog },
          },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [FormsPanel],
      providers: [
        PanelService,
        {
          provide: CoreFormService,
          useValue: {
            formList,
            hierarchyRootNodeIds,
            hierarchyNodeMap,
            createFolder,
            deleteWorkspaceNode,
            storageRecoveryIssues,
            hasStorageRecoveryIssues,
            getStorageRecoveryBackup: () => '{}',
            resetCorruptedStorage,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormsPanel);
    fixture.detectChanges();
  });

  it('shows the first-run empty state and starter copy', () => {
    expect(fixture.nativeElement.textContent).toContain('No Forms Yet');
    expect(fixture.nativeElement.textContent).toContain(
      'Click the + button to add a new form. You can also add the default form',
    );
    expect(fixture.nativeElement.querySelector('button[aria-label="Create Form"]')).toBeTruthy();
  });

  it('opens the shared filter and clears the query when search closes', () => {
    hierarchyRootNodeIds.set(['form-1']);
    hierarchyNodeMap.set({
      'form-1': {
        id: 'form-1',
        name: 'Marketing Form',
        type: 'form',
        parentId: null,
        idPath: ['form-1'],
        libraryId: 'form-material',
        fieldCount: 0,
      },
    });

    fixture.detectChanges();

    const filterInput = () =>
      fixture.nativeElement.querySelector('input[placeholder="Filter items..."]');
    const search = fixture.nativeElement.querySelector(
      'button[aria-label="Search forms and folders"]',
    );
    expect(filterInput()).toBeNull();

    search.click();
    fixture.detectChanges();
    expect(filterInput()).toBeTruthy();

    fixture.componentInstance.filterValue.set('zzz');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[aria-label="Close search"]').click();
    fixture.detectChanges();

    expect(filterInput()).toBeNull();
    expect(fixture.componentInstance.filterValue()).toBe('');
  });

  it('shows an empty filter state when no forms or folders match', () => {
    hierarchyRootNodeIds.set(['folder-1', 'form-1']);
    hierarchyNodeMap.set({
      'folder-1': {
        id: 'folder-1',
        name: 'Marketing Folder',
        type: 'folder',
        parentId: null,
        idPath: ['folder-1'],
        childIds: [],
        isExpanded: true,
      },
      'form-1': {
        id: 'form-1',
        name: 'Marketing Form',
        type: 'form',
        parentId: null,
        idPath: ['form-1'],
        libraryId: 'form-material',
        fieldCount: 0,
      },
    });

    fixture.componentInstance.filterValue.set('zzz');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No forms or folders found');
    expect(fixture.nativeElement.textContent).toContain('Try adjusting your filter criteria.');
  });

  it('delegates starter actions to the form service and create-form dialog', () => {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const createNewButton = buttons.find((button) => button.textContent?.includes('Create Form'));
    const addNewButton = fixture.nativeElement.querySelector(
      'button[aria-label="Create Form"]',
    ) as HTMLButtonElement | null;
    const addFolderButton = fixture.nativeElement.querySelector(
      'button[aria-label="New folder"]',
    ) as HTMLButtonElement | null;

    expect(createNewButton).toBeTruthy();
    expect(addNewButton).toBeTruthy();
    expect(addFolderButton).toBeTruthy();

    createNewButton?.click();
    addNewButton?.click();
    addFolderButton?.click();

    expect(openCreateFormDialog).toHaveBeenCalledTimes(2);
    expect(openCreateFormDialog).toHaveBeenCalledWith();
    expect(createFolder).toHaveBeenCalledWith('New Folder');
  });

  it('groups actions and opens the import dialog', () => {
    const group = fixture.nativeElement.querySelector('p-buttongroup');
    const buttons = Array.from(group.querySelectorAll('button')) as HTMLButtonElement[];

    expect(group).toBeTruthy();
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'New folder',
      'Import Form',
      'Create Form',
    ]);
    expect(buttons[2].textContent).toContain('Create Form');

    buttons[1].click();

    expect(openImportDialog).toHaveBeenCalledWith();
  });

  it('offers backup and explicit reset actions for corrupted storage', async () => {
    storageRecoveryIssues.set([
      {
        editorType: 'test-editor',
        kind: 'forms',
        reason: 'invalid-json',
        storageKey: 'formly-studio-forms-test-editor',
        rawValue: '{',
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    const buttons = Array.from(alert.querySelectorAll('button')) as HTMLButtonElement[];
    expect(alert.textContent).toContain('Saved workspace data could not be read.');
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'Download backup',
      'Reset local data',
    ]);

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    buttons[1].click();

    expect(resetCorruptedStorage).toHaveBeenCalledOnce();
  });

  describe('bulk selection', () => {
    beforeEach(() => {
      hierarchyRootNodeIds.set(['folder', 'other']);
      hierarchyNodeMap.set({
        folder: {
          id: 'folder',
          name: 'Folder',
          type: 'folder',
          parentId: null,
          idPath: ['folder'],
          childIds: ['child'],
          isExpanded: true,
        },
        child: {
          id: 'child',
          name: 'Child',
          type: 'form',
          parentId: 'folder',
          idPath: ['folder', 'child'],
          libraryId: 'form-material',
          fieldCount: 0,
        },
        other: {
          id: 'other',
          name: 'Other',
          type: 'form',
          parentId: null,
          idPath: ['other'],
          libraryId: 'form-material',
          fieldCount: 0,
        },
      });
      fixture.detectChanges();
    });

    it('shows the selected count and disables deletion when nothing is selected', () => {
      const panel = fixture.componentInstance;
      const deleteButton = () =>
        fixture.nativeElement.querySelector('button[aria-label^="Delete selected items"]');
      expect(deleteButton().disabled).toBe(true);
      expect(deleteButton().querySelector('[pButtonLabel]').textContent).toBe('0');

      panel.toggleNodeSelection('child');
      fixture.detectChanges();
      expect(deleteButton().getAttribute('aria-label')).toBe('Delete selected items (1)');
      expect(deleteButton().disabled).toBe(false);

      panel.toggleNodeSelection('child');
      fixture.detectChanges();
      expect(deleteButton().disabled).toBe(true);
      expect(deleteButton().querySelector('[pButtonLabel]').textContent).toBe('0');
    });

    it('deletes selected items across filters and retains only selections still in storage', () => {
      const panel = fixture.componentInstance;
      panel.toggleNodeSelection('child');
      panel.toggleNodeSelection('other');
      panel.filterValue.set('Other');
      fixture.detectChanges();
      fixture.nativeElement.querySelector('button[aria-label="Delete selected items (2)"]').click();
      expect(deleteWorkspaceNode.mock.calls).toEqual([['child'], ['other']]);

      const remaining = { ...hierarchyNodeMap() };
      delete remaining['child'];
      hierarchyNodeMap.set(remaining);
      fixture.detectChanges();
      expect(panel.selectedNodeIds()).toEqual(['other']);
      expect(
        fixture.nativeElement.querySelector('button[aria-label="Delete selected items (1)"]'),
      ).toBeTruthy();

      hierarchyNodeMap.set({});
      fixture.detectChanges();
      expect(panel.selectedNodeIds()).toEqual([]);
      expect(
        fixture.nativeElement.querySelector('button[aria-label="Delete selected items (0)"]')
          .disabled,
      ).toBe(true);
    });

    it('deletes a selected folder once when its child is also selected', () => {
      const panel = fixture.componentInstance;
      panel.toggleNodeSelection('child');
      panel.toggleNodeSelection('folder');
      panel.deleteSelectedNodes();
      expect(deleteWorkspaceNode.mock.calls).toEqual([['folder']]);
    });

    it('blocks bulk selection and deletion while storage requires recovery', () => {
      const panel = fixture.componentInstance;
      panel.toggleNodeSelection('child');
      storageRecoveryIssues.set([
        {
          editorType: 'test-editor',
          kind: 'forms',
          reason: 'invalid-json',
          storageKey: 'forms',
          rawValue: '{',
        },
      ]);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('button[aria-label^="Delete selected items"]').disabled,
      ).toBe(true);
      panel.toggleNodeSelection('other');
      panel.deleteSelectedNodes();
      expect(panel.selectedNodeIds()).toEqual(['child']);
      expect(deleteWorkspaceNode).not.toHaveBeenCalled();
    });
  });
});
