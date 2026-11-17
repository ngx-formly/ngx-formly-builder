---
'@ngx-formly/builder': minor
---

Add `BuilderEngineService.createPreviewFields()` for independent, stable Formly previews. Preserve unchanged fields across edits while rebuilding changed parent configurations and repeater templates. Keep exported JSON isolated from preview mutations.

Studio previews retain their form groups and unchanged inputs during field edits, resetting form state when the active document or library changes.
