---
'@ngx-formly/builder-state': minor
'@ngx-formly/builder': minor
---

Add directional field drops: left/right creates or joins an evenly spaced row; top/bottom reorders fields outside the target row. Rows use unkeyed Formly groups and responsive Tailwind utilities, preserving field keys, values, validation, and exported configuration.

The builder now displays edge insertion lines and provides keyboard-accessible row movement in field menus. Dragging across keyed model scopes or onto an occupied repeater template is rejected to preserve data. Existing programmatic `moveField` calls remain supported. No saved-form migration is required.
