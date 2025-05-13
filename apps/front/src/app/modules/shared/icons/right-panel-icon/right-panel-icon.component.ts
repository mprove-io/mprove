import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-right-panel-icon',
  templateUrl: 'right-panel-icon.component.html'
})
export class RightPanelIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
