import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-type-enum-icon',
  templateUrl: 'type-enum-icon.component.html'
})
export class TypeEnumIconComponent {
  @Input()
  size: number;

  constructor() {}
}
