import { Component, Input } from '@angular/core';
import type { SuggestField } from '#common/zod/backend/suggest-field';

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
