import { Component, Input } from '@angular/core';
import { ALL_RESULT_VALUES } from '#common/constants/top';
import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';

@Component({
  standalone: false,
  selector: 'm-field-result',
  templateUrl: './field-result.component.html'
})
export class FieldResultComponent {
  allResultValues = ALL_RESULT_VALUES;

  @Input()
  fieldClass: FieldClass;

  @Input()
  result: FieldResult;

  @Input()
  size: number;

  @Input()
  isEmpty: boolean;

  constructor() {}
}
