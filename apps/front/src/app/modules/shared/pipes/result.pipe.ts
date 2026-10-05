import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';

@Pipe({ standalone: false, name: 'result' })
export class ResultPipe implements PipeTransform {
  transform(value: string) {
    if (isUndefined(value)) {
      return value;
    }

    if (value === ('day_of_week' satisfies FieldResult)) {
      return 'ENUM';
    } else if (value === ('day_of_week_index' satisfies FieldResult)) {
      return 'ENUM';
    } else if (value === ('month_name' satisfies FieldResult)) {
      return 'ENUM';
    } else if (value === ('number' satisfies FieldResult)) {
      return 'NUMBER';
    } else if (value === ('quarter_of_year' satisfies FieldResult)) {
      return 'ENUM';
    } else if (value === ('string' satisfies FieldResult)) {
      return 'STRING';
    } else if (value === ('ts' satisfies FieldResult)) {
      return 'TIMESTAMP';
    } else if (value === ('yesno' satisfies FieldResult)) {
      return 'YES-NO';
    }

    return value;
  }
}
