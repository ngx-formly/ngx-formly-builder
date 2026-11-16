import { CoreFormService } from '../../editor/core-form.service';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { Empty } from '../../empty/empty';
import { CreateFormDialogService } from './create-form-dialog.service';
import { ImportDialogService } from './import-dialog.service';
import { MouseInsideService } from '../../editor/mouse-inside.service';
import { PanelHeader } from '../../shared/panel-header';
import { Tooltip } from '../../shared/tooltip';
import { WorkspaceToolbar } from './workspace-toolbar';
import { WorkspaceTreeItem } from './workspace-tree-item';
import type { WorkspaceNode } from '../../model/types';
import { MatTabsModule } from '@angular/material/tabs';
import { PanelService } from '../../editor/panel.service';
import { ValidationsTabContent } from './validations-tab-content';

@Component({
  selector: 'core-forms-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MouseInsideService],
  imports: [
    MatTabsModule,
    Empty,
    Tooltip,
    WorkspaceToolbar,
    PanelHeader,
    WorkspaceTreeItem,
    ValidationsTabContent,
  ],
  host: {
    class: 'overflow-hidden h-full block',
  },
  template: `
    <core-panel-header
      class="[--panel-header-height:auto]"
      header="Workspace"
      subHeader="Create and manage forms and validations"
    />
    <mat-tab-group
      class="core-tabs min-h-0 flex-1"
      animationDuration="0ms"
      [preserveContent]="true"
      [selectedIndex]="['forms', 'validations'].indexOf(activeTab())"
      (selectedTabChange)="selectTab($event.index === 0 ? 'forms' : 'validations')"
      ><mat-tab
        ><ng-template mat-tab-label>
          <i
            class="material-symbols-outlined size-6 shrink-0 overflow-hidden"
            aria-hidden="true"
            >description</i
          ><span>Forms</span>
        </ng-template>
        <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <core-workspace-toolbar
            class="pb-2"
            searchLabel="Search forms and folders"
            deleteLabel="Delete selected items"
            [canSearch]="showWorkspaceList()"
            [selectedCount]="selectedNodeIds().length"
            [deleteUnavailable]="hasStorageRecoveryIssues()"
            [(filterValue)]="filterValue"
            (deleteSelected)="deleteSelectedNodes()"
          >
            <div
              role="group"
              class="min-w-0 [&>span]:flex"
              aria-label="Workspace actions"
            >
              <button
                coreButton
                class="shrink-0"
                severity="secondary"
                aria-label="New folder"
                coreTooltip="New folder"
                tooltipPosition="above"
                [disabled]="hasStorageRecoveryIssues()"
                (click)="addNewFolder()"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  create_new_folder
                </i>
              </button>
              <button
                coreButton
                class="shrink-0"
                severity="secondary"
                aria-label="Import Form"
                coreTooltip="Import Form"
                tooltipPosition="above"
                [disabled]="hasStorageRecoveryIssues()"
                (click)="openImportDialog()"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  upload
                </i>
              </button>
              <button
                #createButton
                coreButton
                class="min-w-0 @max-[17.5rem]:w-10 @max-[17.5rem]:px-1"
                aria-label="Create Form"
                coreTooltip="Create Form"
                tooltipPosition="above"
                [disabled]="hasStorageRecoveryIssues()"
                (click)="addNewForm()"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  add
                </i>
                <span
                  coreButtonLabel
                  class="truncate @max-[17.5rem]:hidden"
                  >Create Form</span
                >
              </button>
            </div>
          </core-workspace-toolbar>

          @if (hasStorageRecoveryIssues()) {
            <div
              role="alert"
              class="m-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
            >
              <strong>Saved workspace data could not be read.</strong>
              <p class="mt-1">
                Download a backup before resetting the affected local data. Other editor workspaces
                will not be changed.
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  coreButton
                  severity="secondary"
                  outlined
                  (click)="downloadRecoveryBackup()"
                >
                  Download backup
                </button>
                <button
                  coreButton
                  severity="danger"
                  (click)="resetCorruptedStorage()"
                >
                  Reset local data
                </button>
              </div>
            </div>
          }

          @if (showWorkspaceList()) {
            <div class="flex min-h-0 flex-1 flex-col">
              @if (isFiltering() && !filteredVisibleNodeIds().length) {
                <core-empty
                  label="No forms or folders found"
                  description="Try adjusting your filter criteria."
                />
              } @else if (hierarchyRootNodeIds().length) {
                <ul
                  class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4"
                  (mouseenter)="setMouseInside(true)"
                  (mouseleave)="setMouseInside(false)"
                >
                  @for (nodeId of hierarchyRootNodeIds(); track nodeId) {
                    <li
                      [class.hidden]="isFiltering() && !filteredVisibleNodeIds().includes(nodeId)"
                    >
                      <core-workspace-tree-item
                        [nodeId]="nodeId"
                        [isFiltering]="isFiltering()"
                        [filteredVisibleNodeIds]="filteredVisibleNodeIds()"
                        [selectedNodeIds]="selectedNodeIds()"
                        (nodeSelectionToggled)="toggleNodeSelection($event)"
                      />
                    </li>
                  }
                </ul>
              }
            </div>
          } @else {
            <core-empty
              label="No Forms Yet"
              description="Click the + button to add a new form. You can also add the default form"
            >
              <button
                coreButton
                text
                [disabled]="hasStorageRecoveryIssues()"
                (click)="addNewForm()"
              >
                <i class="material-symbols-outlined">assignment</i>
                Create Form
              </button>
            </core-empty>
          }
        </div></mat-tab
      ><mat-tab
        ><ng-template mat-tab-label>
          <i
            class="material-symbols-outlined size-6 shrink-0 overflow-hidden"
            aria-hidden="true"
            >rule</i
          ><span>Validations</span>
        </ng-template>
        <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <core-validations-tab-content /></div></mat-tab
    ></mat-tab-group>
  `,
})
export class FormsPanel {
  private readonly panels = inject(PanelService);
  readonly activeTab = this.panels.activeWorkspaceTab;
  protected formService = inject(CoreFormService);
  protected mouseInsideService = inject(MouseInsideService);
  protected createFormDialogService = inject(CreateFormDialogService);
  private readonly importDialogService = inject(ImportDialogService);
  private readonly document = inject(DOCUMENT);

  formList = this.formService.formList;
  hierarchyRootNodeIds = this.formService.hierarchyRootNodeIds;
  hierarchyNodeMap = this.formService.hierarchyNodeMap;
  readonly hasStorageRecoveryIssues = computed(() =>
    this.formService.storageRecoveryIssues().some((issue) => issue.kind !== 'validations'),
  );

  readonly selectedNodeIds = linkedSignal<Record<string, WorkspaceNode>, string[]>({
    source: this.hierarchyNodeMap,
    computation: (nodes, previous) => previous?.value.filter((id) => !!nodes[id]) ?? [],
  });

  readonly filterValue = signal('');
  readonly isFiltering = computed(() => !!this.filterValue().trim());
  readonly showWorkspaceList = computed(
    () => this.isFiltering() || this.hierarchyRootNodeIds().length > 0,
  );
  readonly filteredVisibleNodeIds = computed(
    () => {
      const query = this.filterValue().trim().toLowerCase();
      if (!query) {
        return [];
      }

      const nodes = Object.values(this.hierarchyNodeMap());
      const visibleNodeIds = new Set<string>();

      nodes
        .filter((node) => node.name.toLowerCase().includes(query))
        .forEach((node) => {
          node.idPath.forEach((id) => visibleNodeIds.add(id));

          nodes
            .filter(
              (candidate) =>
                candidate.idPath.length >= node.idPath.length &&
                node.idPath.every((id, index) => candidate.idPath[index] === id),
            )
            .forEach((candidate) => visibleNodeIds.add(candidate.id));
        });

      return Array.from(visibleNodeIds);
    },
    {
      equal: (a, b) => a.length === b.length && a.every((val, index) => val === b[index]),
    },
  );

  addNewForm(): void {
    this.createFormDialogService.open();
  }

  selectTab(tab: string | number | undefined): void {
    if (tab !== 'forms' && tab !== 'validations') return;
    this.activeTab.set(tab);
    this.panels.setActiveLHSPanel('forms');
  }

  toggleNodeSelection(nodeId: string): void {
    if (this.hasStorageRecoveryIssues()) return;
    this.selectedNodeIds.update((ids) =>
      ids.includes(nodeId) ? ids.filter((id) => id !== nodeId) : [...ids, nodeId],
    );
  }

  deleteSelectedNodes(): void {
    if (this.hasStorageRecoveryIssues()) return;
    const selectedIds = this.selectedNodeIds();
    const nodes = this.hierarchyNodeMap();
    const roots = selectedIds.filter(
      (id) => !nodes[id].idPath.slice(0, -1).some((parentId) => selectedIds.includes(parentId)),
    );
    roots.forEach((id) => this.formService.deleteWorkspaceNode(id));
  }

  addNewFolder(): void {
    this.formService.createFolder?.('New Folder');
  }

  openImportDialog(): void {
    this.importDialogService.open();
  }

  setMouseInside(isInside: boolean) {
    this.mouseInsideService.setMouseInside(isInside);
  }

  downloadRecoveryBackup(): void {
    const backup = this.formService.getStorageRecoveryBackup();
    const editorType = this.formService.storageRecoveryIssues()[0]?.editorType ?? 'workspace';
    const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = `formly-storage-recovery-${editorType}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  resetCorruptedStorage(): void {
    const confirmed = this.document.defaultView?.confirm(
      'Reset the corrupted local data for this workspace? Download a backup first if you may need it.',
    );
    if (confirmed) {
      this.formService.resetCorruptedStorage();
    }
  }
}
