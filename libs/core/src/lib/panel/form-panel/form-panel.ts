import { CoreFormService } from '../../editor/core-form.service';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { combineLatest, debounceTime, filter, map } from 'rxjs';
import { EmptyNoForm } from '../../empty';
import type { FormDisplayMode } from '../../editor/types';
import { JSONContent } from '../../json-content/json-content';
import { JSONFormatValidator } from '../../json-content/json-format-validator';
import { JSONSchemaValidator } from '../../json-content/json-schema-validator';
import { FormBuilderContent } from './form-builder-content';
import { FormPreviewContent } from './form-preview-content';
import { PreviewDeviceToolbar } from './preview-device-toolbar';
import { FormToolbarComponent } from './toolbar';

@Component({
  selector: 'core-form-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormToolbarComponent,
    FormBuilderContent,
    EmptyNoForm,
    JSONContent,
    FormsModule,
    JSONFormatValidator,
    JSONSchemaValidator,
    FormPreviewContent,
    PreviewDeviceToolbar,
  ],
  host: {
    class: 'flex flex-col h-full',
  },
  template: `
    @if (formService.loadingFormId()) {
      <p
        role="status"
        class="shrink-0 px-4 py-2"
      >
        Loading form…
      </p>
    }
    @if (formService.formLoadError(); as error) {
      <div
        role="alert"
        class="flex shrink-0 flex-wrap items-center gap-2 px-4 py-2"
      >
        <span>
          @switch (error.reason) {
            @case ('missing-library') {
              This form needs the unavailable library “{{ error.libraryId }}”.
            }
            @case ('not-found') {
              This form could not be found.
            }
            @case ('recovery-required') {
              Recover the stored forms in the Forms panel before opening this form.
            }
            @case ('invalid-form') {
              This form contains data that could not be opened.
            }
            @default {
              This form could not be loaded. Check your connection and try again.
            }
          }
        </span>
        <button
          coreButton
          type="button"
          size="small"
          (click)="formService.setActiveForm(error.formId)"
        >
          Retry load
        </button>
      </div>
    }
    @if (formService.persistenceError(); as error) {
      <div
        role="alert"
        class="shrink-0 px-4 py-2"
      >
        Could not {{ error.action }}.
        @if (error.failedFormIds?.length) {
          Some forms were not deleted. Review the remaining items in the Forms panel before
          retrying.
        }
      </div>
    }
    @if (activeFormId()) {
      <core-form-toolbar
        class="shrink-0"
        [hideFormTitle]="hideFormTitle()"
      >
        @if (activeFormDisplayMode() !== 'json') {
          <core-preview-device-toolbar
            class="md:mr-auto"
            [scale]="activeFormDisplayMode() === 'preview' ? (previewContent()?.scale() ?? 1) : 1"
          />
        }
      </core-form-toolbar>

      <div class="min-h-0 grow overflow-hidden">
        <div
          role="tabpanel"
          class="block h-full overflow-y-auto px-4 pb-4"
          [hidden]="activeFormDisplayMode() !== 'form'"
        >
          <core-form-builder-content class="min-h-full" />
        </div>
        <div
          role="tabpanel"
          class="block h-full overflow-hidden"
          [hidden]="activeFormDisplayMode() !== 'preview'"
        >
          <core-form-preview-content
            class="h-full"
            [formFields]="(previewFields$ | async) ?? []"
          />
        </div>
        <div
          role="tabpanel"
          class="block h-full px-4 pb-4"
          [hidden]="activeFormDisplayMode() !== 'json'"
        >
          <core-json-content
            class="h-full"
            coreJsonFormat
            [coreJsonSchema]="schema()"
            [ngModel]="activeFormFieldsJSON()"
            [editable]="false"
          />
        </div>
      </div>
    } @else {
      <core-empty-no-form />
    }
  `,
})
export class FormPanel {
  readonly hideFormTitle = input(false);
  protected formService = inject(CoreFormService);
  protected readonly previewContent = viewChild(FormPreviewContent);

  activeFormId = this.formService.activeFormId;
  activeFormFieldsJSON = this.formService.activeFormFieldsJSON;
  activeFormDisplayMode = this.formService.activeFormDisplayMode;
  schema = this.formService.activeSchema;

  activePreviewFormFields$ = toObservable(this.formService.activePreviewFormFields).pipe(
    debounceTime(100),
  );
  displayMode$ = toObservable(this.activeFormDisplayMode);
  previewFields$ = combineLatest([this.displayMode$, this.activePreviewFormFields$]).pipe(
    filter(([mode]) => mode === 'preview'),
    map(([, fields]) => fields),
  );

  setActiveFormDisplayMode(mode?: string | number) {
    if (typeof mode === 'string') {
      this.formService.setActiveFormDisplayMode(mode as FormDisplayMode);
    }
  }
}
