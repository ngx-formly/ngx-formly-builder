import { TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { FormlyForm, provideFormlyCore } from '@ngx-formly/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nativeFieldConfig } from './native-fields';

describe('native file field', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideFormlyCore(nativeFieldConfig)] }),
  );

  async function render(model: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(FormlyForm);
    const form = new UntypedFormGroup({});
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('model', model);
    fixture.componentRef.setInput('fields', [
      {
        type: 'file',
        key: 'picture',
        props: { label: 'Profile Picture', accept: 'image/*', maxFileSize: 4 },
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    return { fixture, form, input };
  }

  function choose(input: HTMLInputElement, file: File) {
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    input.dispatchEvent(new Event('change'));
  }

  it('stores serializable file contents and supports removal', async () => {
    const { fixture, form, input } = await render();
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    choose(input, new File(['png'], 'picture.png', { type: 'image/png' }));
    expect(form.pending).toBe(true);
    await vi.waitFor(() =>
      expect(form.get('picture')?.value).toEqual({
        name: 'picture.png',
        type: 'image/png',
        size: 3,
        dataUrl: 'data:image/png;base64,cG5n',
      }),
    );
    fixture.detectChanges();
    expect(form.valid).toBe(true);
    expect(form.dirty).toBe(true);
    expect(JSON.parse(JSON.stringify(form.value))).toEqual(form.value);
    expect(fixture.nativeElement.textContent).toContain('Saved file: picture.png');
    fixture.nativeElement.querySelector('button').click();
    expect(form.get('picture')?.value).toBeNull();
  });

  it('reopens saved file metadata without writing a filename into the native input', async () => {
    const { fixture, input } = await render({
      picture: {
        name: 'saved.png',
        type: 'image/png',
        size: 3,
        dataUrl: 'data:image/png;base64,cG5n',
      },
    });
    expect(input.value).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Saved file: saved.png');
  });

  it.each([
    {
      file: new File(['large'], 'large.png', { type: 'image/png' }),
      message: 'The file is too large.',
    },
    {
      file: new File(['txt'], 'text.txt', { type: 'text/plain' }),
      message: 'Choose an image file.',
    },
  ])('rejects an invalid attachment: $message', async ({ file, message }) => {
    const { fixture, form, input } = await render();
    choose(input, file);
    fixture.detectChanges();
    expect(form.get('picture')?.value).toBeNull();
    expect(form.invalid).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(message);
    choose(input, new File(['png'], 'valid.png', { type: 'image/png' }));
    await vi.waitFor(() => expect(form.valid).toBe(true));
  });

  it('reports file read errors and permits another selection', async () => {
    const { fixture, form, input } = await render();
    const read = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementationOnce(function (
      this: FileReader,
    ) {
      this.dispatchEvent(new Event('error'));
    });
    choose(input, new File(['png'], 'unreadable.png', { type: 'image/png' }));
    fixture.detectChanges();
    expect(form.invalid).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Could not read this file.');
    read.mockRestore();
    choose(input, new File(['png'], 'readable.png', { type: 'image/png' }));
    await vi.waitFor(() => expect(form.valid).toBe(true));
  });
});
