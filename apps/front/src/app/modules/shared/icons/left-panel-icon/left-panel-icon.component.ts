import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-left-panel-icon',
  templateUrl: 'left-panel-icon.component.html'
})
export class LeftPanelIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
