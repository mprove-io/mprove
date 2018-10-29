import * as api from '../_index';

export interface Fraction {
    brick: string;
    operator: api.FractionOperatorEnum;
    type: api.FractionTypeEnum;
    string_value?: string;
    number_value1?: number;
    number_value2?: number;
    number_values?: string;
    number_between_option?: api.FractionNumberBetweenOptionEnum;
    yesno_value?: api.FractionYesnoValueEnum;
    day_of_week_value?: api.FractionDayOfWeekValueEnum;
    day_of_week_index_values?: string;
    month_name_value?: api.FractionMonthNameValueEnum;
    quarter_of_year_value?: api.FractionQuarterOfYearValueEnum;
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
    ts_relative_unit?: api.FractionTsRelativeUnitEnum;
    ts_relative_complete_option?: api.FractionTsRelativeCompleteOptionEnum;
    ts_relative_when_option?: api.FractionTsRelativeWhenOptionEnum;
    ts_for_option?: api.FractionTsForOptionEnum;
    ts_for_value?: number;
    ts_for_unit?: api.FractionTsForUnitEnum;
    ts_last_value?: number;
    ts_last_unit?: api.FractionTsLastUnitEnum;
    ts_last_complete_option?: api.FractionTsLastCompleteOptionEnum;
}
