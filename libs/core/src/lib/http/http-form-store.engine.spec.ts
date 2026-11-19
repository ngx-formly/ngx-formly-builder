import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BuilderEngineService,
  provideBuilderEngine,
  type EngineLibrary,
  type WorkspaceHierarchy,
} from '@ngx-formly/builder';
import { FieldType, FieldTypeConfig, provideFormlyCore } from '@ngx-formly/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HTTP_FORM_STORE_CONFIG } from './http-form-store.config';
import { HttpFormStoreService } from './http-form-store.service';

const library: EngineLibrary = {
  id: 'headless',
  fieldTypes: [
    { name: 'input', displayName: 'Input', defaultConfig: {} },
    { name: 'group', displayName: 'Group', isParent: true, defaultConfig: {} },
  ],
};

@Component({
  selector: 'core-test-input',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="formControl" />',
})
class TestInput extends FieldType<FieldTypeConfig> {}

describe('BuilderEngineService over HttpFormStoreService', () => {
  const base = 'https://api.test/workspaces/ws';
  let engine: BuilderEngineService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideFormlyCore({ types: [{ name: 'input', component: TestInput }] }),
        provideBuilderEngine({
          editorType: 'ws',
          libraries: [library],
          formStore: HttpFormStoreService,
        }),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HTTP_FORM_STORE_CONFIG, useValue: { baseUrl: 'https://api.test' } },
      ],
    });
    engine = TestBed.inject(BuilderEngineService);
    httpTesting = TestBed.inject(HttpTestingController);

    // Startup: the engine loads the workspace, then (queued) the validation catalog.
    httpTesting.expectOne({ method: 'GET', url: `${base}/forms` }).flush([]);
    httpTesting
      .expectOne({ method: 'GET', url: `${base}/hierarchy` })
      .flush({ workspaceId: 'ws', rootNodeIds: [], nodeMap: {} });
    httpTesting.expectOne({ method: 'GET', url: `${base}/validations` }).flush([]);
  });

  afterEach(() => httpTesting.verify());

  it('creates a form and refreshes the workspace', () => {
    let completed = false;
    engine.addForm$('Contact', [], {}, 'headless', false).subscribe({
      complete: () => (completed = true),
    });

    const post = httpTesting.expectOne({ method: 'POST', url: `${base}/forms` });
    const id = post.request.body.id;
    expect(typeof id).toBe('string');
    expect(post.request.body.name).toBe('Contact');
    post.flush(null, { status: 201, statusText: 'Created' });

    const hierarchy: WorkspaceHierarchy = {
      workspaceId: 'ws',
      rootNodeIds: [id],
      nodeMap: {
        [id]: {
          id,
          name: 'Contact',
          type: 'form',
          libraryId: 'headless',
          fieldCount: 0,
          parentId: null,
          idPath: [id],
        },
      },
    };
    httpTesting
      .expectOne({ method: 'GET', url: `${base}/forms` })
      .flush([{ id, name: 'Contact', libraryId: 'headless', fieldCount: 0, parentId: null }]);
    httpTesting.expectOne({ method: 'GET', url: `${base}/hierarchy` }).flush(hierarchy);

    expect(engine.formList().map((form) => form.id)).toEqual([id]);
    expect(engine.hierarchy().rootNodeIds).toEqual([id]);
    expect(completed).toBe(true);
  });

  it('surfaces a failed create', () => {
    let error: unknown;
    engine.addForm$('Contact', [], {}, 'headless', false).subscribe({ error: (e) => (error = e) });

    httpTesting
      .expectOne({ method: 'POST', url: `${base}/forms` })
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(500);
    expect(httpTesting.match(() => true)).toEqual([]);
  });
});
