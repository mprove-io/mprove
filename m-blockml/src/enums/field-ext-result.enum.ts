/* eslint-disable id-blacklist */
export enum FieldExtResultEnum {
  String = 'String', // dimension, dimension_time, measure, calculation, filter
  Number = 'Number', // dimension, dimension_time, measure, calculation, filter
  DayOfWeek = 'DayOfWeek', // dimension_time
  DayOfWeekIndex = 'DayOfWeekIndex', // dimension_time
  MonthName = 'MonthName', // dimension_time
  QuarterOfYear = 'QuarterOfYear', // dimension_time
  Ts = 'Ts', // dimension_time
  Yesno = 'Yesno', // dimension_time, dimension_yesno_is_true
  FromField = 'FromField' // filter
}
