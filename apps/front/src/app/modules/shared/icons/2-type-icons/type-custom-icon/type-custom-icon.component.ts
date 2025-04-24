import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-type-custom-icon',
  templateUrl: 'type-custom-icon.component.html'
})
export class TypeCustomIconComponent {
  @Input()
  size: number;

  constructor() {}
}
