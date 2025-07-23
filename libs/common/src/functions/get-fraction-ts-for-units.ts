import { TemporalUnit } from '@malloydata/malloy-filter';
import { FractionTsForUnitEnum } from '~common/enums/fraction/fraction-ts-for-unit.enum';

export function getFractionTsForUnits(
  temporalUnit: TemporalUnit
): FractionTsForUnitEnum {
  return temporalUnit === 'year'
    ? FractionTsForUnitEnum.Years
    : temporalUnit === 'quarter'
      ? FractionTsForUnitEnum.Quarters
      : temporalUnit === 'month'
        ? FractionTsForUnitEnum.Months
        : temporalUnit === 'week'
          ? FractionTsForUnitEnum.Weeks
          : temporalUnit === 'day'
            ? FractionTsForUnitEnum.Days
            : temporalUnit === 'hour'
              ? FractionTsForUnitEnum.Hours
              : temporalUnit === 'minute'
                ? FractionTsForUnitEnum.Minutes
                : undefined;
}
