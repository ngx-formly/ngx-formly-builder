# Asynchronous stores and editor lifecycle

Ordinary `FormStoreService` methods return one result per call, possibly asynchronously. Writes
emit `undefined` after they succeed; reads emit a snapshot. The engine consumes the first result.
Only `getRecoveryIssues$` is a live stream. Empty completion is an error, not confirmation of a write.

Mutations are ordered within one engine, including saves and workspace read/modify/write operations.
While saving, further edits are coalesced into a subsequent save. A failed save preserves edits and
requires an explicit `saveActiveForm()` retry; editing does not silently retry it. These guarantees
apply to one engine instance, not concurrent tabs or independent clients sharing remote storage.

Selecting another form saves the current draft first. The latest selection wins; selecting the
current form again cancels a pending switch. Once the target is loading, editing the current draft
cancels that load. `loadingFormId()` identifies the target. `formLoadError()` distinguishes missing
forms, unavailable libraries, store failures, invalid form data, and required storage recovery.
Failures preserve the active document, field selection, and save status. Retry with
`setActiveForm(error.formId)`; a new selection attempt clears the previous load error. The shell
shows these errors and a Retry load action. `formSelected$` emits only successful activations and
explicit unloads.

A failed folder deletion can be partial: successful deletions are not rolled back. The engine waits
for child operations and refreshes the actual workspace. `persistenceError()` exposes the failed
action and, for partial child deletion, `failedFormIds`. Review the remaining tree before retrying.
The existing store interface does not guarantee atomic deletion.

`setActiveForm(null)` explicitly unloads the form and can discard unsaved edits. Destroying the
injector cancels subscriptions, queued work, and pending autosave timers without starting a final
write. A remote write already sent might still commit. A host that needs to preserve edits must
save and await confirmed success **before** unloading or destroying the injector. For example,
in a host with an Angular `Injector` available:

```ts
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';

engine.saveActiveForm();
const status = await firstValueFrom(
  toObservable(engine.saveStatus, { injector }).pipe(
    filter((value) => value === 'saved' || value === 'error'),
  ),
);
if (status === 'saved') {
  // The host may now close its editor, provided no further edits are accepted.
}
// On error, keep the editor open and offer an explicit save retry.
```

## Validation catalog

Stores can implement both `getValidations$(editorType)` and `saveValidations$(editorType, validations)`
to support the Workspace Validations tab. These optional methods follow the same snapshot and write
completion rules as forms. Without both methods, the shell shows the catalog as unavailable;
field-only custom validation remains available.

`WorkspaceValidation` contains `id`, `name`, `expression`, and `message`. Rules belong to an editor
namespace and are copied into fields when selected. The engine serializes catalog read/modify/write
operations and updates its `validations()` signal only after a successful write. It exposes
`validationsLoading()` and `validationsLoadError()`; retry loading with `loadValidations()`.
`saveValidation$(draft, id?)` creates or updates a rule, and `deleteValidation$(id)` removes it.
Subscribe to these operations and handle errors in the host. Expressions must use supported Formly
syntax; the shell checks them with the Formly parser before saving.

The local store uses `formly-studio-validations-${editorType}`. It preserves unreadable catalog data
and reports a recovery issue with kind `validations`. `resetValidations$()` invokes
`resetCorruptedStorage$(editorType, 'validations')`: stores supporting this recovery action must
reset only the affected catalog. Omitting the optional kind retains the existing reset-all-affected-data
behavior. Catalog load/write failures do not change the active form or its save status.

## Builder settings

With `editableSettings: true`, users can change autosave and its delay in the Builder settings panel.
Stores can implement both `getSettings$(editorType)` and `saveSettings$(editorType, settings)` to keep
these changes. `BuilderSettings` contains `autoSave` and `autoSaveDelay`, an integer from 0 to
2147483647 milliseconds. Saved settings belong to an editor namespace and take precedence over the
host's `autoSave` and `autoSaveDelay`. `getSettings$` emits `undefined` when none are saved, so that
the host values apply.

`settings()` exposes the settings in effect and `settingsStorageAvailable` tells whether changes are
stored. Without `editableSettings` or without both methods, saved settings are neither read nor
written, and changes last until the engine is destroyed. The engine serializes settings operations
with its other mutations. `updateSettings$(settings)` applies new values only after a successful
write. `resetSettings$()` saves the current host values, so later changes to the host configuration
need another reset. Subscribe to these operations and handle errors in the host.

A failed read, or an invalid value from the store, keeps the current settings and sets
`settingsLoadError()`; retry with `loadSettings()`. Settings failures do not change the active form or
its save status. A new delay restarts the timer of a pending edit; disabling autosave saves it
immediately.

`LocalFormStoreService` does not keep settings, so with the default store changes last for the
session; users can export them as JSON. To keep them in the browser, extend it with the two methods,
as Studio does in `apps/studio/src/app/form-editor/studio-form-store.ts`. That store treats corrupt
or invalid saved data as nothing saved; an unreadable local storage is a read failure.

## Remote HTTP store

`@ngx-formly/builder/http` provides `HttpFormStoreService`, a store for any backend that implements
the [form store OpenAPI description](form-store.openapi.yaml). Register it with a base URL:

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HTTP_FORM_STORE_CONFIG, HttpFormStoreService } from '@ngx-formly/builder/http';
import { provideFormlyBuilder } from '@ngx-formly/builder/ui';

providers: [
  provideHttpClient(withInterceptors([authInterceptor])),
  provideFormlyBuilder({ formStore: HttpFormStoreService /* …other options */ }),
  { provide: HTTP_FORM_STORE_CONFIG, useValue: { baseUrl: 'https://api.example.com' } },
];
```

Authentication, headers and retries belong to the host's `HttpClient` interceptors. A `404` from
`GET /forms/{formId}` means a missing form; every other HTTP error reaches the engine as a store
failure, except a `404` from `GET /settings`, which means no saved settings. The store supports the
validation catalog and builder settings but not local recovery
(`getRecoveryIssues$`/`resetCorruptedStorage$`): the server owns its data integrity. The ordering
guarantees above apply to one engine; the API has no concurrency control between clients.
