import { Component, Input } from '@angular/core';

import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import {
  type FieldResult,
  fieldResultValues
} from '#common/types/blockml/parts/field/field-result';

@Component({
  standalone: false,
  selector: 'm-field-result',
  templateUrl: './field-result.component.html'
})
export class FieldResultComponent {
  readonly booleanFieldResults: FieldResult[] = ['yesno', 'boolean'];
  readonly temporalFieldResults: FieldResult[] = ['ts', 'date'];

  allResultValues = fieldResultValues;

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
