import type { ConnectedPosition } from '@angular/cdk/overlay';

// Offset the first menu item's anchor by the popup's padding and border.
export const railSubmenuPositions: ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top',
    offsetX: 7,
    offsetY: -7
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'top',
    offsetX: -7,
    offsetY: -7
  }
];
