import { Component, Input } from '@angular/core';
import type { ModelField } from '#common/types/blockml/model-field';

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
