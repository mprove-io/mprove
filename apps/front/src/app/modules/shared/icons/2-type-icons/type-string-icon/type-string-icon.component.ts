import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-type-string-icon',
  templateUrl: 'type-string-icon.component.html'
})
export class TypeStringIconComponent {
  @Input()
  size: number;

  constructor() {}
}
