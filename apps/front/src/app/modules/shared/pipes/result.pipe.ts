import { Pipe, PipeTransform } from '@angular/core';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';

@Pipe({ standalone: false, name: 'result' })
export class ResultPipe implements PipeTransform {
  transform(value: string) {
    if (isUndefined(value)) {
      return value;
    }

    if (value === 'day_of_week') {
      return 'ENUM';
    } else if (value === 'day_of_week_index') {
      return 'ENUM';
    } else if (value === 'month_name') {
      return 'ENUM';
    } else if (value === 'number') {
      return 'NUMBER';
    } else if (value === 'quarter_of_year') {
      return 'ENUM';
    } else if (value === 'string') {
      return 'STRING';
    } else if (value === 'ts') {
      return 'TIMESTAMP';
    } else if (value === 'yesno') {
      return 'YES-NO';
    }

    return value;
  }
}
