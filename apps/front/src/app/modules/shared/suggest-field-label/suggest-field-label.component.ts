import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-suggest-field-label',
  templateUrl: './suggest-field-label.component.html'
})
export class SuggestFieldLabelComponent {
  @Input()
  suggestField: common.SuggestField;

  constructor() {}
}
