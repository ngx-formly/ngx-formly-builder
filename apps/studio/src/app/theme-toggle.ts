import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeToggleService } from './theme-toggle.service';
import { ResponsiveService } from './responsive.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <button
      coreButton
      text
      aria-label="Toggle Light/Dark Theme"
      (click)="toggleTheme()"
    >
      <i
        coreButtonIcon
        class="material-symbols-outlined"
      >
        {{ iconName() }}
      </i>
      @if (!isMobile()) {
        <span coreButtonLabel>{{ iconLabel() }}</span>
      }
    </button>
  `,
})
export class ThemeToggle {
  themeService = inject(ThemeToggleService);
  responsiveService = inject(ResponsiveService);

  isMobile = this.responsiveService.isMobile;

  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');
  readonly iconName = computed(() => (this.isDarkMode() ? 'light_mode' : 'dark_mode'));
  readonly iconLabel = computed(() => (this.isDarkMode() ? 'Light' : 'Dark'));

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
