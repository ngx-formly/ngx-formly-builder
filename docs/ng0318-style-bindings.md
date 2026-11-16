# Angular NG0318 style bindings

This historical investigation applied to PrimeNG 21.1.10 with Angular 22.2.3. PrimeNG returned
invalid values from its chip inline styles, producing Angular NG0318 warnings.

The initial `0.0.1` release replaces those chips with native elements and removes PrimeNG,
its style workaround and peer overrides. No host patch or PrimeNG provider is required.
