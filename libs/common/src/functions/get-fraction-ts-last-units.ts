import { TemporalUnit } from '@malloydata/malloy-filter';
import { FractionTsLastUnitEnum } from '~common/enums/fraction/fraction-ts-last-unit.enum';

export function getFractionTsLastUnits(
  temporalUnit: TemporalUnit
): FractionTsLastUnitEnum {
  return temporalUnit === 'year'
    ? FractionTsLastUnitEnum.Years
    : temporalUnit === 'quarter'
      ? FractionTsLastUnitEnum.Quarters
      : temporalUnit === 'month'
        ? FractionTsLastUnitEnum.Months
        : temporalUnit === 'week'
          ? FractionTsLastUnitEnum.Weeks
          : temporalUnit === 'day'
            ? FractionTsLastUnitEnum.Days
            : temporalUnit === 'hour'
              ? FractionTsLastUnitEnum.Hours
              : temporalUnit === 'minute'
                ? FractionTsLastUnitEnum.Minutes
                : undefined;
}
