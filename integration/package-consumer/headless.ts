import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  BuilderEngineService,
  PropertyChangeType,
  provideBuilderEngine,
} from '@ngx-formly/builder';

// @ts-expect-error The root package must not expose the editor UI.
type EditorComponent = typeof import('@ngx-formly/builder').FormlyBuilder;
// @ts-expect-error UI providers belong to the optional /ui entry point.
type EditorProvider = typeof import('@ngx-formly/builder').provideFormlyBuilder;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Headless consumer</h1>
    <button (click)="engine.addField('input')">Add field</button>
    <button (click)="requireField()">Require field</button>
    <button (click)="engine.removeField(engine.activeFieldId()!)">Remove field</button>
    <pre>{{ engine.activeFormFieldsJSON() }}</pre>
  `,
})
class HeadlessConsumer {
  readonly engine = inject(BuilderEngineService);

  constructor() {
    this.engine
      .addForm$(
        'Headless form',
        [{ key: 'name', type: 'input', props: { label: 'Name' } }],
        {},
        'native',
      )
      .subscribe();
  }

  requireField() {
    this.engine.modifyActiveField({
      type: PropertyChangeType.VALUE,
      path: ['props', 'required'],
      value: true,
    });
  }
}

bootstrapApplication(HeadlessConsumer, {
  providers: [
    provideBuilderEngine({
      editorType: 'headless-consumer',
      autoSave: false,
      libraries: [
        {
          id: 'native',
          fieldTypes: [
            {
              name: 'input',
              displayName: 'Text',
              defaultConfig: { props: { label: 'New field' } },
            },
          ],
        },
      ],
    }),
  ],
}).catch(console.error);
