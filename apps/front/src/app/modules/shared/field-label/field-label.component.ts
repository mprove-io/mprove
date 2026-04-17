import { Component, Input } from '@angular/core';
import type { ModelField } from '#common/zod/blockml/model-field';

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
