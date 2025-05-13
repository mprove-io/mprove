import { enums } from '~common/barrels/enums';

export function getTimeSpecDetail(item: {
  timeSpec: enums.TimeSpecEnum;
  weekStart: enums.ProjectWeekStartEnum;
}) {
  let { timeSpec, weekStart } = item;

  let timeSpecDetail =
    timeSpec === enums.TimeSpecEnum.Years
      ? enums.DetailUnitEnum.Years
      : timeSpec === enums.TimeSpecEnum.Quarters
        ? enums.DetailUnitEnum.Quarters
        : timeSpec === enums.TimeSpecEnum.Months
          ? enums.DetailUnitEnum.Months
          : timeSpec === enums.TimeSpecEnum.Weeks &&
              weekStart === enums.ProjectWeekStartEnum.Monday
            ? enums.DetailUnitEnum.WeeksMonday
            : timeSpec === enums.TimeSpecEnum.Weeks &&
                weekStart === enums.ProjectWeekStartEnum.Sunday
              ? enums.DetailUnitEnum.WeeksSunday
              : timeSpec === enums.TimeSpecEnum.Days
                ? enums.DetailUnitEnum.Days
                : timeSpec === enums.TimeSpecEnum.Hours
                  ? enums.DetailUnitEnum.Hours
                  : timeSpec === enums.TimeSpecEnum.Minutes
                    ? enums.DetailUnitEnum.Minutes
                    : timeSpec === enums.TimeSpecEnum.Timestamps
                      ? enums.DetailUnitEnum.Timestamps
                      : undefined;

  return timeSpecDetail;
}
