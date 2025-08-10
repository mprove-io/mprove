import { common } from '~node-common/barrels/common';

export function getUnitDuration(item: {
  unit: common.FractionTsUnitEnum;
  value: number;
}) {
  let { unit, value } = item;

  let unitDuration =
    unit === common.FractionTsUnitEnum.Years
      ? { years: value }
      : unit === common.FractionTsUnitEnum.Quarters
        ? { months: value * 3 }
        : unit === common.FractionTsUnitEnum.Months
          ? { months: value }
          : unit === common.FractionTsUnitEnum.Weeks
            ? { days: value * 7 }
            : unit === common.FractionTsUnitEnum.Days
              ? { days: value }
              : unit === common.FractionTsUnitEnum.Hours
                ? { hours: value }
                : unit === common.FractionTsUnitEnum.Minutes
                  ? { minutes: value }
                  : unit === common.FractionTsUnitEnum.Seconds
                    ? { seconds: value }
                    : undefined;

  return unitDuration;
}
