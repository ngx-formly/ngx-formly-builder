import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  BaseEditorForm,
  BuilderSettings,
  DefaultForm,
  FormStoreService,
  WorkspaceHierarchy,
  WorkspaceValidation,
} from '@ngx-formly/builder';
import { catchError, map, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { HTTP_FORM_STORE_CONFIG } from './http-form-store.config';

/** HttpClient emits the response body (`null` for 204); the store contract emits `undefined`. */
const toUndefined = (): OperatorFunction<unknown, undefined> => map(() => undefined);

/** A missing resource is an absent value in the store contract, not an error. */
const notFoundToUndefined = <T>(): OperatorFunction<T, T | undefined> =>
  catchError((error: unknown) =>
    error instanceof HttpErrorResponse && error.status === 404
      ? of(undefined)
      : throwError(() => error),
  );

// use @Service({ autoProvided: false }) in a future PR
@Injectable()
export class HttpFormStoreService implements FormStoreService {
  readonly label: string = 'Remote API';
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(HTTP_FORM_STORE_CONFIG).baseUrl.replace(/\/+$/, '');

  addForm$(workspaceId: string, form: DefaultForm): Observable<void> {
    return this.http.post(this.url(workspaceId, 'forms'), form).pipe(toUndefined());
  }

  updateForm$(workspaceId: string, form: DefaultForm): Observable<void> {
    return this.http.put(this.url(workspaceId, 'forms', form.id!), form).pipe(toUndefined());
  }

  removeForm$(workspaceId: string, formId: string): Observable<void> {
    return this.http.delete(this.url(workspaceId, 'forms', formId)).pipe(toUndefined());
  }

  getForm$(workspaceId: string, formId: string): Observable<DefaultForm | undefined> {
    return this.http
      .get<DefaultForm>(this.url(workspaceId, 'forms', formId))
      .pipe(notFoundToUndefined());
  }

  getFormList$(workspaceId: string): Observable<BaseEditorForm[]> {
    return this.http.get<BaseEditorForm[]>(this.url(workspaceId, 'forms'));
  }

  getHierarchy$(workspaceId: string): Observable<WorkspaceHierarchy> {
    return this.http.get<WorkspaceHierarchy>(this.url(workspaceId, 'hierarchy'));
  }

  saveHierarchy$(workspaceId: string, hierarchy: WorkspaceHierarchy): Observable<void> {
    return this.http.put(this.url(workspaceId, 'hierarchy'), hierarchy).pipe(toUndefined());
  }

  getValidations$(workspaceId: string): Observable<WorkspaceValidation[]> {
    return this.http.get<WorkspaceValidation[]>(this.url(workspaceId, 'validations'));
  }

  saveValidations$(workspaceId: string, validations: WorkspaceValidation[]): Observable<void> {
    return this.http.put(this.url(workspaceId, 'validations'), validations).pipe(toUndefined());
  }

  getSettings$(workspaceId: string): Observable<BuilderSettings | undefined> {
    return this.http
      .get<BuilderSettings>(this.url(workspaceId, 'settings'))
      .pipe(notFoundToUndefined());
  }

  saveSettings$(
    workspaceId: string,
    { autoSave, autoSaveDelay }: BuilderSettings,
  ): Observable<void> {
    return this.http
      .put(this.url(workspaceId, 'settings'), { autoSave, autoSaveDelay })
      .pipe(toUndefined());
  }

  private url(workspaceId: string, ...segments: string[]): string {
    return [this.baseUrl, 'workspaces', workspaceId, ...segments]
      .map((s: string, i: number) => (i === 0 ? s : encodeURIComponent(s)))
      .join('/');
  }
}
