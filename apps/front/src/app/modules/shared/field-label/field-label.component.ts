import { Component, Input } from '@angular/core';
import { ModelField } from '~common/interfaces/blockml/model-field';

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
