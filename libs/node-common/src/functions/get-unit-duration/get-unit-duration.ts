import type { FractionTsUnit } from '#common/types/blockml/parts/fraction/fraction-ts-unit';

export function getUnitDuration(item: { unit: FractionTsUnit; value: number }) {
  let { unit, value } = item;

  let unitDuration =
    unit === 'years'
      ? { years: value }
      : unit === 'quarters'
        ? { months: value * 3 }
        : unit === 'months'
          ? { months: value }
          : unit === 'weeks'
            ? { days: value * 7 }
            : unit === 'days'
              ? { days: value }
              : unit === 'hours'
                ? { hours: value }
                : unit === 'minutes'
                  ? { minutes: value }
                  : unit === 'seconds'
                    ? { seconds: value }
                    : undefined;

  return unitDuration;
}
