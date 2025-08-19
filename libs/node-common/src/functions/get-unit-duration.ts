import { FractionTsUnitEnum } from '~common/enums/fraction/fraction-ts-unit.enum';

export function getUnitDuration(item: {
  unit: FractionTsUnitEnum;
  value: number;
}) {
  let { unit, value } = item;

  let unitDuration =
    unit === FractionTsUnitEnum.Years
      ? { years: value }
      : unit === FractionTsUnitEnum.Quarters
        ? { months: value * 3 }
        : unit === FractionTsUnitEnum.Months
          ? { months: value }
          : unit === FractionTsUnitEnum.Weeks
            ? { days: value * 7 }
            : unit === FractionTsUnitEnum.Days
              ? { days: value }
              : unit === FractionTsUnitEnum.Hours
                ? { hours: value }
                : unit === FractionTsUnitEnum.Minutes
                  ? { minutes: value }
                  : unit === FractionTsUnitEnum.Seconds
                    ? { seconds: value }
                    : undefined;

  return unitDuration;
}
