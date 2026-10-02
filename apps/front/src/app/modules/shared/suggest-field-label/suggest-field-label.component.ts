import { Component, Input } from '@angular/core';
import type { SuggestField } from '#common/types/backend/parts/suggest-field';

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
