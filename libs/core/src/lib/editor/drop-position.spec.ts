import { describe, expect, it } from 'vitest';
import { getDropPosition } from './drop-position';

describe('field drop targets', () => {
  const rect = { left: 100, top: 200, width: 600, height: 120 };
  it.each([
    [105, 260, 'left'],
    [695, 260, 'right'],
    [400, 205, 'top'],
    [400, 315, 'bottom'],
  ] as const)('uses the closest normalized edge at %i, %i', (x, y, expected) => {
    expect(getDropPosition(x, y, rect, false)).toBe(expected);
    expect(getDropPosition(x, y, rect, true)).toBe(expected);
  });
  it('reserves the center for groups only', () => {
    expect(getDropPosition(400, 260, rect, true)).toBe('center');
    expect(getDropPosition(400, 260, rect, false)).toBe('bottom');
  });
  it('uses current bounds after scrolling', () => {
    expect(getDropPosition(400, 105, { ...rect, top: 100 }, false)).toBe('top');
  });
});
