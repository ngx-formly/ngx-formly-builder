---
'@ngx-formly/builder': minor
---

Add `editableSettings` so users can change, save, export and import autosave settings and the values offered for Height, Width, Margin and Padding in Builder settings. Hosts set these values with `styleValues`; custom style options link to them with `valueList`. Stores can persist them with the optional `getSettings$` and `saveSettings$` methods; the HTTP store supports both, the default local store does not.
