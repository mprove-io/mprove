import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-both-panels-icon',
  templateUrl: 'both-panels-icon.component.html'
})
export class BothPanelsIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
