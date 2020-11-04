import * as apiEnums from '../../enums/_index';

export class Fraction {
  brick: string;
  operator: apiEnums.FractionOperatorEnum;
  type: apiEnums.FractionTypeEnum;
  stringValue?: string;
  numberValue1?: number;
  numberValue2?: number;
  numberValues?: string;
  numberBetweenOption?: apiEnums.FractionNumberBetweenOptionEnum;
  yesnoValue?: apiEnums.FractionYesnoValueEnum;
  dayOfWeekValue?: apiEnums.FractionDayOfWeekValueEnum;
  dayOfWeekIndexValues?: string;
  monthNameValue?: apiEnums.FractionMonthNameValueEnum;
  quarterOfYearValue?: apiEnums.FractionQuarterOfYearValueEnum;
  tsDateYear?: number;
  tsDateMonth?: number;
  tsDateDay?: number;
  tsDateHour?: number;
  tsDateMinute?: number;
  tsDateToYear?: number;
  tsDateToMonth?: number;
  tsDateToDay?: number;
  tsDateToHour?: number;
  tsDateToMinute?: number;
  tsRelativeValue?: number;
  tsRelativeUnit?: apiEnums.FractionTsRelativeUnitEnum;
  tsRelativeCompleteOption?: apiEnums.FractionTsRelativeCompleteOptionEnum;
  tsRelativeWhenOption?: apiEnums.FractionTsRelativeWhenOptionEnum;
  tsForOption?: apiEnums.FractionTsForOptionEnum;
  tsForValue?: number;
  tsForUnit?: apiEnums.FractionTsForUnitEnum;
  tsLastValue?: number;
  tsLastUnit?: apiEnums.FractionTsLastUnitEnum;
  tsLastCompleteOption?: apiEnums.FractionTsLastCompleteOptionEnum;
}
