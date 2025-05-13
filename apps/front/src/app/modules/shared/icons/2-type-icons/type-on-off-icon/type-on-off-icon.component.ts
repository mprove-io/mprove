import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-type-on-off-icon',
  templateUrl: 'type-on-off-icon.component.html'
})
export class TypeOnOffIconComponent {
  @Input()
  size: number;

  constructor() {}
}
