import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-field-result',
  templateUrl: './field-result.component.html'
})
export class FieldResultComponent {
  fieldClassDimension = common.FieldClassEnum.Dimension;
  fieldClassMeasure = common.FieldClassEnum.Measure;
  fieldClassCalculation = common.FieldClassEnum.Calculation;
  fieldClassFilter = common.FieldClassEnum.Filter;

  fieldResultDayOfWeek = common.FieldResultEnum.DayOfWeek;
  fieldResultDayOfWeekIndex = common.FieldResultEnum.DayOfWeekIndex;
  fieldResultMonthName = common.FieldResultEnum.MonthName;
  fieldResultQuarterOfYear = common.FieldResultEnum.QuarterOfYear;
  fieldResultTs = common.FieldResultEnum.Ts;
  // fieldResultTimestamp = common.FieldResultEnum.Timestamp;
  fieldResultYesno = common.FieldResultEnum.Yesno;
  fieldResultString = common.FieldResultEnum.String;
  fieldResultNumber = common.FieldResultEnum.Number;
  fieldResultDate = common.FieldResultEnum.Date;
  fieldResultBoolean = common.FieldResultEnum.Boolean;
  fieldResultArray = common.FieldResultEnum.Array;
  fieldResultRecord = common.FieldResultEnum.Record;
  fieldResultJson = common.FieldResultEnum.Json;
  fieldResultSqlNative = common.FieldResultEnum.SqlNative;

  allResultValues = common.ALL_RESULT_VALUES;

  @Input()
  fieldClass: common.FieldClassEnum;

  @Input()
  result: common.FieldResultEnum;

  @Input()
  size: number;

  @Input()
  isEmpty: boolean;

  constructor() {}
}
