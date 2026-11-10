---
'@ngx-formly/builder': patch
'@ngx-formly/builder-state': patch
---

Add Forms and Validations tabs to Workspace, with saved expression rules that can be copied into fields from Custom Validation. Rules can be created and edited in dialogs without changing the active form.

Add the WorkspaceValidation type, catalog operations on BuilderEngineService, and optional getValidations$/saveValidations$ store methods. Existing custom stores remain compatible and show the catalog as unavailable until both methods are implemented. Local validation storage is isolated by editor namespace and supports backup and scoped recovery. Existing form documents require no migration.

Expose PanelService.activeWorkspaceTab for host navigation. Studio now uses /workspaces/forms and /workspaces/validations, with form editor routes under /workspaces/forms/:formId. Existing Studio links redirect while retaining query parameters and fragments.
