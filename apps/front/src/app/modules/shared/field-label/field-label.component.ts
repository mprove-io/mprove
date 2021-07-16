import { Component, Input } from '@angular/core';
import { ColumnField } from '~front/app/queries/mq.query';

@Component({
  selector: 'm-field-label',
  templateUrl: './field-label.component.html'
})
export class FieldLabelComponent {
  @Input()
  column: ColumnField;

  constructor() {}
}
