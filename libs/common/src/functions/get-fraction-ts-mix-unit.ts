import { TemporalUnit, WeekdayMoment } from '@malloydata/malloy-filter';
import { FractionTsMixUnitEnum } from '~common/enums/fraction/fraction-ts-mix-unit.enum';

export function getFractionTsMixUnit(
  temporalUnit: TemporalUnit | WeekdayMoment['moment']
): FractionTsMixUnitEnum {
  return temporalUnit === 'year'
    ? FractionTsMixUnitEnum.Year
    : temporalUnit === 'quarter'
      ? FractionTsMixUnitEnum.Quarter
      : temporalUnit === 'month'
        ? FractionTsMixUnitEnum.Month
        : temporalUnit === 'week'
          ? FractionTsMixUnitEnum.Week
          : temporalUnit === 'day'
            ? FractionTsMixUnitEnum.Day
            : temporalUnit === 'hour'
              ? FractionTsMixUnitEnum.Hour
              : temporalUnit === 'minute'
                ? FractionTsMixUnitEnum.Minute
                : temporalUnit === 'second'
                  ? FractionTsMixUnitEnum.Second
                  : temporalUnit === 'sunday'
                    ? FractionTsMixUnitEnum.Sunday
                    : temporalUnit === 'monday'
                      ? FractionTsMixUnitEnum.Monday
                      : temporalUnit === 'tuesday'
                        ? FractionTsMixUnitEnum.Tuesday
                        : temporalUnit === 'wednesday'
                          ? FractionTsMixUnitEnum.Wednesday
                          : temporalUnit === 'thursday'
                            ? FractionTsMixUnitEnum.Thursday
                            : temporalUnit === 'friday'
                              ? FractionTsMixUnitEnum.Friday
                              : temporalUnit === 'saturday'
                                ? FractionTsMixUnitEnum.Saturday
                                : undefined;
}
