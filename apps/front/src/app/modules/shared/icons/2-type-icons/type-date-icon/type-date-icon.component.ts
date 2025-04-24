import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-type-date-icon',
  templateUrl: 'type-date-icon.component.html'
})
export class TypeDateIconComponent {
  @Input()
  size: number;

  constructor() {}
}
