import { enums } from '~common/barrels/enums';

export function getFractionTypeForAny(result: enums.FieldResultEnum) {
  return result === enums.FieldResultEnum.DayOfWeek
    ? enums.FractionTypeEnum.DayOfWeekIsAnyValue
    : result === enums.FieldResultEnum.DayOfWeekIndex
    ? enums.FractionTypeEnum.DayOfWeekIndexIsAnyValue
    : result === enums.FieldResultEnum.MonthName
    ? enums.FractionTypeEnum.MonthNameIsAnyValue
    : result === enums.FieldResultEnum.Number
    ? enums.FractionTypeEnum.NumberIsAnyValue
    : result === enums.FieldResultEnum.QuarterOfYear
    ? enums.FractionTypeEnum.QuarterOfYearIsAnyValue
    : result === enums.FieldResultEnum.String
    ? enums.FractionTypeEnum.StringIsAnyValue
    : result === enums.FieldResultEnum.Ts
    ? enums.FractionTypeEnum.TsIsAnyValue
    : result === enums.FieldResultEnum.Yesno
    ? enums.FractionTypeEnum.YesnoIsAnyValue
    : undefined;
}
