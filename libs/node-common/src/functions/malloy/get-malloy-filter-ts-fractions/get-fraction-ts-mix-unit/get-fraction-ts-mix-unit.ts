import type { TemporalUnit, WeekdayMoment } from '@malloydata/malloy-filter';
import type { FractionTsMixUnit } from '#common/types/blockml/parts/fraction/fraction-ts-mix-unit';

export function getFractionTsMixUnit(
  temporalUnit: TemporalUnit | WeekdayMoment['moment']
): FractionTsMixUnit {
  return temporalUnit === 'year'
    ? 'year'
    : temporalUnit === 'quarter'
      ? 'quarter'
      : temporalUnit === 'month'
        ? 'month'
        : temporalUnit === 'week'
          ? 'week'
          : temporalUnit === 'day'
            ? 'day'
            : temporalUnit === 'hour'
              ? 'hour'
              : temporalUnit === 'minute'
                ? 'minute'
                : temporalUnit === 'second'
                  ? 'second'
                  : temporalUnit === 'sunday'
                    ? 'sunday'
                    : temporalUnit === 'monday'
                      ? 'monday'
                      : temporalUnit === 'tuesday'
                        ? 'tuesday'
                        : temporalUnit === 'wednesday'
                          ? 'wednesday'
                          : temporalUnit === 'thursday'
                            ? 'thursday'
                            : temporalUnit === 'friday'
                              ? 'friday'
                              : temporalUnit === 'saturday'
                                ? 'saturday'
                                : undefined;
}
