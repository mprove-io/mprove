import type { FieldResult } from '#common/types/blockml/parts/field/field-result';

export function getFractionTypeForAny(result: FieldResult) {
  return result === 'string'
    ? 'StringIsAnyValue'
    : result === 'number'
      ? 'NumberIsAnyValue'
      : result === 'ts'
        ? 'TsIsAnyValue'
        : result === 'date'
          ? 'TsIsAnyValue'
          : result === 'boolean'
            ? 'BooleanIsAnyValue'
            : result === 'yesno'
              ? 'YesnoIsAnyValue'
              : result === 'day_of_week'
                ? 'DayOfWeekIsAnyValue'
                : result === 'day_of_week_index'
                  ? 'DayOfWeekIndexIsAnyValue'
                  : result === 'month_name'
                    ? 'MonthNameIsAnyValue'
                    : result === 'quarter_of_year'
                      ? 'QuarterOfYearIsAnyValue'
                      : undefined;
}
