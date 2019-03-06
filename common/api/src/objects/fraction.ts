import * as apiEnums from '../enums/_index';

export interface Fraction {
  brick: string;
  operator: apiEnums.FractionOperatorEnum;
  type: apiEnums.FractionTypeEnum;
  string_value?: string;
  number_value1?: number;
  number_value2?: number;
  number_values?: string;
  number_between_option?: apiEnums.FractionNumberBetweenOptionEnum;
  yesno_value?: apiEnums.FractionYesnoValueEnum;
  day_of_week_value?: apiEnums.FractionDayOfWeekValueEnum;
  day_of_week_index_values?: string;
  month_name_value?: apiEnums.FractionMonthNameValueEnum;
  quarter_of_year_value?: apiEnums.FractionQuarterOfYearValueEnum;
  ts_date_year?: number;
  ts_date_month?: number;
  ts_date_day?: number;
  ts_date_hour?: number;
  ts_date_minute?: number;
  ts_date_to_year?: number;
  ts_date_to_month?: number;
  ts_date_to_day?: number;
  ts_date_to_hour?: number;
  ts_date_to_minute?: number;
  ts_relative_value?: number;
  ts_relative_unit?: apiEnums.FractionTsRelativeUnitEnum;
  ts_relative_complete_option?: apiEnums.FractionTsRelativeCompleteOptionEnum;
  ts_relative_when_option?: apiEnums.FractionTsRelativeWhenOptionEnum;
  ts_for_option?: apiEnums.FractionTsForOptionEnum;
  ts_for_value?: number;
  ts_for_unit?: apiEnums.FractionTsForUnitEnum;
  ts_last_value?: number;
  ts_last_unit?: apiEnums.FractionTsLastUnitEnum;
  ts_last_complete_option?: apiEnums.FractionTsLastCompleteOptionEnum;
}
