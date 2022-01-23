import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-field-label',
  templateUrl: './field-label.component.html'
})
export class FieldLabelComponent {
  @Input()
  column: common.MconfigField;

  constructor() {}
}
