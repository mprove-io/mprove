import { Pipe, PipeTransform } from '@angular/core';
import { common } from '~front/barrels/common';

@Pipe({ name: 'result' })
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class ResultPipe implements PipeTransform {
  transform(value: string) {
    if (common.isUndefined(value)) {
      return value;
    }

    if (value === common.FieldResultEnum.DayOfWeek) {
      return 'ENUM';
    } else if (value === common.FieldResultEnum.DayOfWeekIndex) {
      return 'ENUM';
    } else if (value === common.FieldResultEnum.MonthName) {
      return 'ENUM';
    } else if (value === common.FieldResultEnum.Number) {
      return 'NUMBER';
    } else if (value === common.FieldResultEnum.QuarterOfYear) {
      return 'ENUM';
    } else if (value === common.FieldResultEnum.String) {
      return 'STRING';
    } else if (value === common.FieldResultEnum.Ts) {
      return 'TIMESTAMP';
    } else if (value === common.FieldResultEnum.Yesno) {
      return 'YES-NO';
    }

    return value;
  }
}
