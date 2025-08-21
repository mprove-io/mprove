import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-field-label',
  templateUrl: './field-label.component.html'
})
export class FieldLabelComponent {
  @Input()
  column: ModelField;

  constructor() {}
}
