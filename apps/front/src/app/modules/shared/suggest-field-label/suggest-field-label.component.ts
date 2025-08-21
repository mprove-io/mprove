import { Component, Input } from '@angular/core';

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
