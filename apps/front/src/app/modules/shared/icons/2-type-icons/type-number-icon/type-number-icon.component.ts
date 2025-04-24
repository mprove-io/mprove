import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-type-number-icon',
  templateUrl: 'type-number-icon.component.html'
})
export class TypeNumberIconComponent {
  @Input()
  size: number;

  constructor() {}
}
