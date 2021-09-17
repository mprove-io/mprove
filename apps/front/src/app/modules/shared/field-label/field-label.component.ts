import { Component, Input } from '@angular/core';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-field-label',
  templateUrl: './field-label.component.html'
})
export class FieldLabelComponent {
  @Input()
  column: interfaces.ColumnField;

  constructor() {}
}
