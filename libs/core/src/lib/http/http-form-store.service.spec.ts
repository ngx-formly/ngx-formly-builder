import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type {
  BuilderSettings,
  DefaultForm,
  WorkspaceHierarchy,
  WorkspaceValidation,
} from '@ngx-formly/builder';
import { Observable } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { HTTP_FORM_STORE_CONFIG } from './http-form-store.config';
import { HttpFormStoreService } from './http-form-store.service';

function collect<T>(source: Observable<T>) {
  const result: { values: T[]; error?: unknown; completed: boolean } = {
    values: [],
    completed: false,
  };
  source.subscribe({
    next: (value) => result.values.push(value),
    error: (error) => (result.error = error),
    complete: () => (result.completed = true),
  });
  return result;
}

function setup(baseUrl = 'https://api.test') {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      HttpFormStoreService,
      { provide: HTTP_FORM_STORE_CONFIG, useValue: { baseUrl } },
    ],
  });
  return {
    service: TestBed.inject(HttpFormStoreService),
    httpTesting: TestBed.inject(HttpTestingController),
  };
}

describe('HttpFormStoreService', () => {
  const base = 'https://api.test/workspaces/ws';
  const form: DefaultForm = {
    id: 'form-1',
    name: 'Form 1',
    libraryId: 'lib',
    fields: [],
    model: {},
  };
  const hierarchy: WorkspaceHierarchy = { workspaceId: 'ws', rootNodeIds: [], nodeMap: {} };
  const validations: WorkspaceValidation[] = [
    { id: 'v1', name: 'zip', expression: 'x', message: 'm' },
  ];
  const settings: BuilderSettings = { autoSave: false, autoSaveDelay: 500 };
  const noContent = { status: 204, statusText: 'No Content' };

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('lists forms', () => {
    const { service, httpTesting } = setup();
    const list = [{ id: 'form-1', name: 'Form 1', libraryId: 'lib', fieldCount: 0 }];
    const result = collect(service.getFormList$('ws'));
    httpTesting.expectOne({ method: 'GET', url: `${base}/forms` }).flush(list);
    expect(result.values).toEqual([list]);
    expect(result.completed).toBe(true);
  });

  it('adds a form', () => {
    const { service, httpTesting } = setup();
    const result = collect(service.addForm$('ws', form));
    const req = httpTesting.expectOne({ method: 'POST', url: `${base}/forms` });
    expect(req.request.body).toEqual(form);
    req.flush(null, { status: 201, statusText: 'Created' });
    expect(result.values).toEqual([undefined]);
    expect(result.completed).toBe(true);
  });

  it('updates a form', () => {
    const { service, httpTesting } = setup();
    const result = collect(service.updateForm$('ws', form));
    const req = httpTesting.expectOne({ method: 'PUT', url: `${base}/forms/form-1` });
    expect(req.request.body).toEqual(form);
    req.flush(null, noContent);
    expect(result.values).toEqual([undefined]);
  });

  it('removes a form', () => {
    const { service, httpTesting } = setup();
    const result = collect(service.removeForm$('ws', 'form-1'));
    httpTesting.expectOne({ method: 'DELETE', url: `${base}/forms/form-1` }).flush(null, noContent);
    expect(result.values).toEqual([undefined]);
  });

  it('gets a form', () => {
    const { service, httpTesting } = setup();
    const result = collect(service.getForm$('ws', 'form-1'));
    httpTesting.expectOne({ method: 'GET', url: `${base}/forms/form-1` }).flush(form);
    expect(result.values).toEqual([form]);
  });

  it('maps 404 to undefined', () => {
    const { service, httpTesting } = setup();
    const result = collect(service.getForm$('ws', 'missing'));
    httpTesting
      .expectOne({ method: 'GET', url: `${base}/forms/missing` })
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(result.values).toEqual([undefined]);
    expect(result.error).toBeUndefined();
    expect(result.completed).toBe(true);
  });

  it.each([500, 401, 0])('propagates status %s errors', (status) => {
    const { service, httpTesting } = setup();
    const result = collect(service.getForm$('ws', 'form-1'));
    const req = httpTesting.expectOne({ method: 'GET', url: `${base}/forms/form-1` });
    if (status === 0) req.error(new ProgressEvent('error'));
    else req.flush(null, { status, statusText: 'Error' });
    expect(result.values).toEqual([]);
    expect(result.error).toBeInstanceOf(HttpErrorResponse);
    expect((result.error as HttpErrorResponse).status).toBe(status);
  });

  it('reads and saves the hierarchy', () => {
    const { service, httpTesting } = setup();
    const read = collect(service.getHierarchy$('ws'));
    httpTesting.expectOne({ method: 'GET', url: `${base}/hierarchy` }).flush(hierarchy);
    expect(read.values).toEqual([hierarchy]);

    const write = collect(service.saveHierarchy$('ws', hierarchy));
    const req = httpTesting.expectOne({ method: 'PUT', url: `${base}/hierarchy` });
    expect(req.request.body).toEqual(hierarchy);
    req.flush(null, noContent);
    expect(write.values).toEqual([undefined]);
  });

  it('reads and saves validations', () => {
    const { service, httpTesting } = setup();
    const read = collect(service.getValidations$('ws'));
    httpTesting.expectOne({ method: 'GET', url: `${base}/validations` }).flush(validations);
    expect(read.values).toEqual([validations]);

    const write = collect(service.saveValidations$('ws', validations));
    const req = httpTesting.expectOne({ method: 'PUT', url: `${base}/validations` });
    expect(req.request.body).toEqual(validations);
    req.flush(null, noContent);
    expect(write.values).toEqual([undefined]);
  });

  it('reads and saves settings', () => {
    const { service, httpTesting } = setup();
    const read = collect(service.getSettings$('ws'));
    httpTesting.expectOne({ method: 'GET', url: `${base}/settings` }).flush(settings);
    expect(read.values).toEqual([settings]);

    const write = collect(service.saveSettings$('ws', settings));
    const req = httpTesting.expectOne({ method: 'PUT', url: `${base}/settings` });
    expect(req.request.body).toEqual(settings);
    req.flush(null, noContent);
    expect(write.values).toEqual([undefined]);
    expect(write.completed).toBe(true);
  });

  it('sends only known settings fields', () => {
    const { service, httpTesting } = setup();
    collect(service.saveSettings$('ws', { ...settings, styles: {} } as BuilderSettings));
    const req = httpTesting.expectOne({ method: 'PUT', url: `${base}/settings` });
    expect(req.request.body).toEqual(settings);
    req.flush(null, noContent);
  });

  it('sends style values', () => {
    const { service, httpTesting } = setup();
    const withValues = { ...settings, styleValues: { padding: [{ value: 'px' }] } };
    collect(service.saveSettings$('ws', withValues));
    const req = httpTesting.expectOne({ method: 'PUT', url: `${base}/settings` });
    expect(req.request.body).toEqual(withValues);
    req.flush(null, noContent);
  });

  it('reads no settings when none were saved', () => {
    const { service, httpTesting } = setup();
    const result = collect(service.getSettings$('ws'));
    httpTesting
      .expectOne({ method: 'GET', url: `${base}/settings` })
      .flush(null, { status: 404, statusText: 'Not Found' });
    expect(result.values).toEqual([undefined]);
    expect(result.error).toBeUndefined();
    expect(result.completed).toBe(true);
  });

  it.each(['GET', 'PUT'])('propagates %s settings errors', (method) => {
    const { service, httpTesting } = setup();
    const result = collect<unknown>(
      method === 'GET' ? service.getSettings$('ws') : service.saveSettings$('ws', settings),
    );
    httpTesting
      .expectOne({ method, url: `${base}/settings` })
      .flush(null, { status: 500, statusText: 'Error' });
    expect(result.values).toEqual([]);
    expect((result.error as HttpErrorResponse).status).toBe(500);
  });

  it('ignores a trailing slash in baseUrl', () => {
    const { service, httpTesting } = setup('https://api.test/');
    const result = collect(service.getFormList$('ws'));
    httpTesting.expectOne({ method: 'GET', url: 'https://api.test/workspaces/ws/forms' }).flush([]);
    expect(result.values).toEqual([[]]);
  });

  it('encodes path segments', () => {
    const { service, httpTesting } = setup();
    const result = collect(service.getForm$('my ws', 'a/b'));
    httpTesting
      .expectOne({ method: 'GET', url: 'https://api.test/workspaces/my%20ws/forms/a%2Fb' })
      .flush(form);
    expect(result.values).toEqual([form]);
  });

  it('declares a label and no local recovery', () => {
    const { service } = setup();
    expect(service.label).toBe('Remote API');
    expect('getRecoveryIssues$' in service).toBe(false);
    expect('resetCorruptedStorage$' in service).toBe(false);
  });
});
