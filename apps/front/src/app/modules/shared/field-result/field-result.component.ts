import { Component, Input } from '@angular/core';
import { ALL_RESULT_VALUES } from '~common/constants/top';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';

@Component({
  standalone: false,
  selector: 'm-field-result',
  templateUrl: './field-result.component.html'
})
export class FieldResultComponent {
  fieldClassDimension = FieldClassEnum.Dimension;
  fieldClassMeasure = FieldClassEnum.Measure;
  fieldClassCalculation = FieldClassEnum.Calculation;
  fieldClassFilter = FieldClassEnum.Filter;

  fieldResultDayOfWeek = FieldResultEnum.DayOfWeek;
  fieldResultDayOfWeekIndex = FieldResultEnum.DayOfWeekIndex;
  fieldResultMonthName = FieldResultEnum.MonthName;
  fieldResultQuarterOfYear = FieldResultEnum.QuarterOfYear;
  fieldResultTs = FieldResultEnum.Ts;
  // fieldResultTimestamp = FieldResultEnum.Timestamp;
  fieldResultYesno = FieldResultEnum.Yesno;
  fieldResultString = FieldResultEnum.String;
  fieldResultNumber = FieldResultEnum.Number;
  fieldResultDate = FieldResultEnum.Date;
  fieldResultBoolean = FieldResultEnum.Boolean;
  fieldResultArray = FieldResultEnum.Array;
  fieldResultRecord = FieldResultEnum.Record;
  fieldResultJson = FieldResultEnum.Json;
  fieldResultSqlNative = FieldResultEnum.SqlNative;

  allResultValues = ALL_RESULT_VALUES;

  @Input()
  fieldClass: FieldClassEnum;

  @Input()
  result: FieldResultEnum;

  @Input()
  size: number;

  @Input()
  isEmpty: boolean;

  constructor() {}
}
