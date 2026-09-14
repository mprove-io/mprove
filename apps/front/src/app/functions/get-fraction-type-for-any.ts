import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';

export function getFractionTypeForAny(result: FieldResultEnum) {
  return result === FieldResultEnum.String
    ? FractionTypeEnum.StringIsAnyValue
    : result === FieldResultEnum.Number
      ? FractionTypeEnum.NumberIsAnyValue
      : result === FieldResultEnum.Ts
        ? FractionTypeEnum.TsIsAnyValue
        : result === FieldResultEnum.Date
          ? FractionTypeEnum.TsIsAnyValue
          : result === FieldResultEnum.Boolean
            ? FractionTypeEnum.BooleanIsAnyValue
            : result === FieldResultEnum.Yesno
              ? FractionTypeEnum.YesnoIsAnyValue
              : result === FieldResultEnum.DayOfWeek
                ? FractionTypeEnum.DayOfWeekIsAnyValue
                : result === FieldResultEnum.DayOfWeekIndex
                  ? FractionTypeEnum.DayOfWeekIndexIsAnyValue
                  : result === FieldResultEnum.MonthName
                    ? FractionTypeEnum.MonthNameIsAnyValue
                    : result === FieldResultEnum.QuarterOfYear
                      ? FractionTypeEnum.QuarterOfYearIsAnyValue
                      : undefined;
}
