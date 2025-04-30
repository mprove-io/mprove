import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-bottom-panel-icon',
  templateUrl: 'bottom-panel-icon.component.html'
})
export class BottomPanelIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
