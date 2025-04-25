import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-field-result',
  templateUrl: './field-result.component.html'
})
export class FieldResultComponent {
  fieldClassDimension = common.FieldClassEnum.Dimension;
  fieldClassMeasure = common.FieldClassEnum.Measure;
  fieldClassCalculation = common.FieldClassEnum.Calculation;
  fieldClassFilter = common.FieldClassEnum.Filter;

  fieldResultNumber = common.FieldResultEnum.Number;
  fieldResultString = common.FieldResultEnum.String;
  fieldResultYesno = common.FieldResultEnum.Yesno;
  fieldResultTs = common.FieldResultEnum.Ts;
  fieldResultDayOfWeek = common.FieldResultEnum.DayOfWeek;
  fieldResultDayOfWeekIndex = common.FieldResultEnum.DayOfWeekIndex;
  fieldResultMonthName = common.FieldResultEnum.MonthName;
  fieldResultQuarterOfYear = common.FieldResultEnum.QuarterOfYear;

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
