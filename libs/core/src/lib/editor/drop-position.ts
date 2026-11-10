import { FieldDropPosition } from './types';

/** Normalized edges give wide fields usable side targets as well as vertical targets. */
export function getDropPosition(
  x: number,
  y: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  isParent: boolean,
): FieldDropPosition {
  const horizontal = (x - rect.left) / rect.width;
  const vertical = (y - rect.top) / rect.height;
  if (isParent && horizontal > 0.25 && horizontal < 0.75 && vertical > 0.25 && vertical < 0.75) {
    return 'center';
  }
  const sideDistance = Math.min(horizontal, 1 - horizontal);
  const verticalDistance = Math.min(vertical, 1 - vertical);
  if (verticalDistance <= sideDistance) return vertical < 0.5 ? 'top' : 'bottom';
  return horizontal < 0.5 ? 'left' : 'right';
}
