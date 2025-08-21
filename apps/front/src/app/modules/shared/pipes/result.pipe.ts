import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false, name: 'result' })
export class ResultPipe implements PipeTransform {
  transform(value: string) {
    if (isUndefined(value)) {
      return value;
    }

    if (value === FieldResultEnum.DayOfWeek) {
      return 'ENUM';
    } else if (value === FieldResultEnum.DayOfWeekIndex) {
      return 'ENUM';
    } else if (value === FieldResultEnum.MonthName) {
      return 'ENUM';
    } else if (value === FieldResultEnum.Number) {
      return 'NUMBER';
    } else if (value === FieldResultEnum.QuarterOfYear) {
      return 'ENUM';
    } else if (value === FieldResultEnum.String) {
      return 'STRING';
    } else if (value === FieldResultEnum.Ts) {
      return 'TIMESTAMP';
    } else if (value === FieldResultEnum.Yesno) {
      return 'YES-NO';
    }

    return value;
  }
}
