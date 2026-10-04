import type { TemporalUnit } from '@malloydata/malloy-filter';
import type { FractionTsUnit } from '#common/types/blockml/parts/fraction/fraction-ts-unit';

export function getFractionTsUnits(temporalUnit: TemporalUnit): FractionTsUnit {
  return temporalUnit === 'year'
    ? 'years'
    : temporalUnit === 'quarter'
      ? 'quarters'
      : temporalUnit === 'month'
        ? 'months'
        : temporalUnit === 'week'
          ? 'weeks'
          : temporalUnit === 'day'
            ? 'days'
            : temporalUnit === 'hour'
              ? 'hours'
              : temporalUnit === 'minute'
                ? 'minutes'
                : temporalUnit === 'second'
                  ? 'seconds'
                  : undefined;
}
