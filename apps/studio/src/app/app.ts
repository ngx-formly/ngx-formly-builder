import {
  ChangeDetectionStrategy,
  Component,
  type Signal,
  type TemplateRef,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Header, RouterOutlet],
  host: {
    class: 'flex flex-col h-full bg-(--p-content-background)',
  },
  template: `
    <app-header
      class="h-(--app-header-height) shrink-0"
      [center]="page()?.headerTitle?.()"
    />
    <main class="min-h-0 flex-1">
      <router-outlet
        (activate)="page.set($event)"
        (deactivate)="page.set(null)"
      />
    </main>
  `,
})
export class App {
  protected readonly page = signal<{
    headerTitle?: Signal<TemplateRef<unknown> | undefined>;
  } | null>(null);
}
