/* eslint-disable id-blacklist */
export enum FieldAnyResultEnum {
  String = 'string', // dimension, dimension_time, measure, calculation, filter
  Number = 'number', // dimension, dimension_time, measure, calculation, filter
  DayOfWeek = 'day_of_week', // dimension_time
  DayOfWeekIndex = 'day_of_week_index', // dimension_time
  MonthName = 'month_name', // dimension_time
  QuarterOfYear = 'quarter_of_year', // dimension_time
  Ts = 'ts', // dimension_time
  Yesno = 'yesno' // dimension_time, dimension_yesno_is_true
}
