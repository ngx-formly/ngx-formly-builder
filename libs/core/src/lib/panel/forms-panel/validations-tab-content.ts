import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import saveAs from 'file-saver';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { defer, finalize, Observable } from 'rxjs';
import { CoreFormService } from '../../editor/core-form.service';
import { Empty } from '../../empty/empty';
import { WorkspaceValidation } from '../../model/types';
import {
  ValidationExpression,
  ValidationExpressionEditor,
} from '../../properties/custom-validation/validation-expression-editor';
import { Filter } from '../../shared/filter';
import { Tooltip } from '../../shared/tooltip';

@Component({
  selector: 'core-validations-tab-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Dialog,
    Empty,
    Filter,
    Tooltip,
    ValidationExpressionEditor,
  ],
  host: { class: 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden' },
  template: `
    @if (!forms.validationStorageAvailable) {
      <core-empty
        label="Saved validations unavailable"
        description="This editor's storage provider does not support saved validations."
      />
    } @else {
      <div class="px-4">
        <button
          pButton
          [disabled]="unavailable()"
          (click)="open('new')"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            aria-hidden="true"
            >add</i
          >
          <span pButtonLabel>Create validation</span>
        </button>
      </div>
      @if (forms.validationsLoading()) {
        <p
          role="status"
          class="px-4"
        >
          Loading validations…
        </p>
      }
      @if (forms.validationRecoveryIssues().length) {
        <div
          role="alert"
          class="mx-4 flex flex-col gap-3"
        >
          <p>
            Saved validations could not be read. Download a backup before resetting this catalog.
            Your forms will be kept.
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              pButton
              severity="secondary"
              (click)="downloadBackup()"
            >
              Download backup
            </button>
            <button
              pButton
              severity="danger"
              [disabled]="busy()"
              (click)="reset()"
            >
              Reset validations
            </button>
          </div>
        </div>
      } @else if (forms.validationsLoadError()) {
        <div
          role="alert"
          class="px-4"
        >
          <p>{{ forms.validationsLoadError() }}</p>
          <button
            pButton
            text
            [disabled]="forms.validationsLoading()"
            (click)="forms.loadValidations()"
          >
            Try again
          </button>
        </div>
      }
      @if (error() && !editing()) {
        <p
          role="alert"
          class="px-4 text-red-700 dark:text-red-300"
        >
          {{ error() }}
        </p>
      }
      @if (!forms.validationsLoadError() && !forms.validationsLoading()) {
        @if (forms.validations().length || filterValue()) {
          <div class="px-4">
            <core-filter
              [(value)]="filterValue"
              (clear)="filterValue.set('')"
            />
          </div>
          <ul class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            @for (rule of filteredValidations(); track rule.id) {
              <li class="flex min-w-0 items-center gap-1 rounded-sm hover:bg-emphasis">
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-2 rounded-sm px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-primary"
                  [disabled]="busy()"
                  [attr.aria-label]="'Edit validation ' + rule.name"
                  (click)="open(rule)"
                >
                  <i
                    class="material-symbols-outlined shrink-0"
                    aria-hidden="true"
                    >rule</i
                  >
                  <span class="min-w-0">
                    <span class="block truncate font-semibold">{{ rule.name }}</span>
                    <span class="block truncate text-sm text-muted-color">{{ rule.message }}</span>
                  </span>
                </button>
                <button
                  pButton
                  text
                  rounded
                  severity="danger"
                  coreTooltip="Delete validation"
                  [disabled]="busy()"
                  [attr.aria-label]="'Delete validation ' + rule.name"
                  (click)="remove(rule)"
                >
                  <i
                    pButtonIcon
                    class="material-symbols-outlined"
                    aria-hidden="true"
                    >delete</i
                  >
                </button>
              </li>
            } @empty {
              <li>
                <core-empty
                  label="No validations found"
                  description="Try adjusting your filter criteria."
                />
              </li>
            }
          </ul>
        } @else {
          <core-empty
            label="No validations yet"
            description="Create a validation to reuse it from a field's Custom Validation menu."
          />
        }
      }
    }

    <p-dialog
      modal
      appendTo="body"
      styleClass="core-root"
      [header]="editing() === 'new' ? 'Create validation' : 'Edit validation'"
      [visible]="!!editing()"
      [closable]="!busy()"
      [closeOnEscape]="!busy()"
      [style]="{ width: '36rem', maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - 32px)' }"
      (visibleChange)="close()"
    >
      @if (editing()) {
        <p class="mb-4 text-sm text-muted-color">
          Selecting this validation on a field creates a copy. Changes here apply to future copies.
        </p>
        @if (error()) {
          <p
            role="alert"
            class="mb-3 text-red-700 dark:text-red-300"
          >
            {{ error() }}
          </p>
        }
        <core-validation-expression-editor
          [originalName]="editingRule()?.name ?? ''"
          [rule]="editingRule()"
          [reservedNames]="reservedNames()"
          [saving]="busy()"
          (saved)="save($event)"
          (cancelled)="close()"
        />
      }
    </p-dialog>
  `,
})
export class ValidationsTabContent {
  readonly forms = inject(CoreFormService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly filterValue = signal('');
  readonly editing = signal<WorkspaceValidation | 'new' | null>(null);
  readonly editingRule = computed(() => {
    const rule = this.editing();
    return rule && rule !== 'new' ? rule : undefined;
  });
  readonly reservedNames = computed(() => this.forms.validations().map((rule) => rule.name));
  readonly busy = signal(false);
  readonly error = signal('');
  readonly unavailable = computed(
    () => this.busy() || this.forms.validationsLoading() || !!this.forms.validationsLoadError(),
  );
  readonly filteredValidations = computed(() => {
    const query = this.filterValue().trim().toLowerCase();
    return this.forms.validations().filter((rule) => rule.name.toLowerCase().includes(query));
  });

  open(rule: WorkspaceValidation | 'new'): void {
    this.error.set('');
    this.editing.set(rule);
  }

  close(): void {
    if (!this.busy()) this.editing.set(null);
  }

  save({ name, rule }: { name: string; rule: ValidationExpression }): void {
    const id = this.editingRule()?.id;
    this.run(
      () =>
        this.forms.saveValidation$(
          { name, expression: rule.expression, message: rule.message ?? '' },
          id,
        ),
      'Could not save this validation. Check that its name is unique and try again.',
      () => this.editing.set(null),
    );
  }

  remove(rule: WorkspaceValidation): void {
    if (
      this.document.defaultView?.confirm(
        `Delete validation "${rule.name}"? Existing field copies will be kept.`,
      )
    ) {
      this.run(
        () => this.forms.deleteValidation$(rule.id),
        'Could not delete this validation. Try again.',
      );
    }
  }

  downloadBackup(): void {
    saveAs(
      new Blob([this.forms.getStorageRecoveryBackup('validations')], { type: 'application/json' }),
      'formly-validations-recovery.json',
    );
  }

  reset(): void {
    if (
      this.document.defaultView?.confirm(
        'Reset the corrupted validation catalog? Download a backup first. Your forms will be kept.',
      )
    ) {
      this.run(
        () => this.forms.resetValidations$(),
        'Could not reset saved validations. Try again.',
      );
    }
  }

  private run(operation: () => Observable<void>, errorMessage: string, saved?: () => void): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    defer(operation)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: () => saved?.(),
        error: () => this.error.set(errorMessage),
      });
  }
}
