import { TemporalUnit } from '@malloydata/malloy-filter';
import { FractionTsUnitEnum } from '#common/enums/fraction/fraction-ts-unit.enum';

export function getFractionTsUnits(
  temporalUnit: TemporalUnit
): FractionTsUnitEnum {
  return temporalUnit === 'year'
    ? FractionTsUnitEnum.Years
    : temporalUnit === 'quarter'
      ? FractionTsUnitEnum.Quarters
      : temporalUnit === 'month'
        ? FractionTsUnitEnum.Months
        : temporalUnit === 'week'
          ? FractionTsUnitEnum.Weeks
          : temporalUnit === 'day'
            ? FractionTsUnitEnum.Days
            : temporalUnit === 'hour'
              ? FractionTsUnitEnum.Hours
              : temporalUnit === 'minute'
                ? FractionTsUnitEnum.Minutes
                : temporalUnit === 'second'
                  ? FractionTsUnitEnum.Seconds
                  : undefined;
}
