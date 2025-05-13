import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-type-custom-icon',
  templateUrl: 'type-custom-icon.component.html'
})
export class TypeCustomIconComponent {
  @Input()
  size: number;

  constructor() {}
}
