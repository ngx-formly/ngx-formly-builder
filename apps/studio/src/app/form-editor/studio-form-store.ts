import { Injectable } from '@angular/core';
import {
  BuilderSettings,
  copyBuilderSettings,
  isBuilderSettings,
  LocalFormStoreService,
} from '@ngx-formly/builder';
import { Observable, of, throwError } from 'rxjs';

/** Local store that also keeps the builder settings, so Studio users find them after a reload. */
@Injectable()
export class StudioFormStore extends LocalFormStoreService {
  readonly settingsStorageKey = 'formly-studio-settings';

  getSettings$(editorType: string): Observable<BuilderSettings | undefined> {
    const raw = localStorage.getItem(`${this.settingsStorageKey}-${editorType}`);
    let value: unknown;
    try {
      value = JSON.parse(raw ?? 'null');
    } catch {
      // Corrupt JSON: host defaults apply.
    }

    return of(isBuilderSettings(value) ? value : undefined);
  }

  saveSettings$(editorType: string, settings: BuilderSettings): Observable<void> {
    if (!isBuilderSettings(settings)) {
      return throwError(() => new Error('Invalid builder settings.'));
    }

    localStorage.setItem(
      `${this.settingsStorageKey}-${editorType}`,
      JSON.stringify(copyBuilderSettings(settings)),
    );
    return of(undefined);
  }
}
