import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-type-filter-icon',
  templateUrl: 'type-filter-icon.component.html'
})
export class TypeFilterIconComponent {
  @Input()
  size: number;

  constructor() {}
}
