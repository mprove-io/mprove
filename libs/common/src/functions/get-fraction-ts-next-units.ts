import { TemporalUnit } from '@malloydata/malloy-filter';
import { FractionTsNextUnitEnum } from '~common/enums/fraction/fraction-ts-next-unit.enum';

export function getFractionTsNextUnits(
  temporalUnit: TemporalUnit
): FractionTsNextUnitEnum {
  return temporalUnit === 'year'
    ? FractionTsNextUnitEnum.Years
    : temporalUnit === 'quarter'
      ? FractionTsNextUnitEnum.Quarters
      : temporalUnit === 'month'
        ? FractionTsNextUnitEnum.Months
        : temporalUnit === 'week'
          ? FractionTsNextUnitEnum.Weeks
          : temporalUnit === 'day'
            ? FractionTsNextUnitEnum.Days
            : temporalUnit === 'hour'
              ? FractionTsNextUnitEnum.Hours
              : temporalUnit === 'minute'
                ? FractionTsNextUnitEnum.Minutes
                : undefined;
}
