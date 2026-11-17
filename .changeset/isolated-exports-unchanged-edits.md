---
'@ngx-formly/builder': patch
---

Keep exported JSON independent from fields mutated by Formly previews. Skip unchanged field value updates and clearing absent properties so they do not rebuild previews, mark forms dirty or trigger autosave.
