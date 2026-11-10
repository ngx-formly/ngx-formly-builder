import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { tailwindConfig } from './config/tailwind';
import { StylingClassType } from './styling-class-type';
import { ClassType, CORE_STYLES_CONFIG } from './types';

describe('StylingClassType', () => {
  it('renders an empty catalogue without requiring a breakpoint', () => {
    TestBed.configureTestingModule({
      imports: [StylingClassType],
      providers: [
        {
          provide: CORE_STYLES_CONFIG,
          useValue: { ...tailwindConfig, breakpoints: [], className: [], fieldGroupClassName: [] },
        },
      ],
    });
    const fixture = TestBed.createComponent(StylingClassType);
    fixture.componentRef.setInput('classType', ClassType.CLASS_NAME);
    fixture.componentRef.setInput('classNameMap', {});
    fixture.componentRef.setInput('fieldGroupClassNameMap', {});
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No styling presets configured.');
  });
});
