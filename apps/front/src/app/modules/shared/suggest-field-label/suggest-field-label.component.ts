import { Component, Input } from '@angular/core';
import { SuggestField } from '~common/interfaces/backend/suggest-field';

@Component({
  standalone: false,
  selector: 'm-suggest-field-label',
  templateUrl: './suggest-field-label.component.html'
})
export class SuggestFieldLabelComponent {
  @Input()
  suggestField: SuggestField;

  constructor() {}
}
