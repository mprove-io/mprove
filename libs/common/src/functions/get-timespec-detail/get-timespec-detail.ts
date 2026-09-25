import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';

export function getTimeSpecDetail(item: {
  timeSpec: TimeSpecEnum;
  weekStart: ProjectWeekStartEnum;
}) {
  let { timeSpec, weekStart } = item;

  let timeSpecDetail =
    timeSpec === TimeSpecEnum.Years
      ? DetailUnitEnum.Years
      : timeSpec === TimeSpecEnum.Quarters
        ? DetailUnitEnum.Quarters
        : timeSpec === TimeSpecEnum.Months
          ? DetailUnitEnum.Months
          : timeSpec === TimeSpecEnum.Weeks &&
              weekStart === ProjectWeekStartEnum.Monday
            ? DetailUnitEnum.WeeksMonday
            : timeSpec === TimeSpecEnum.Weeks &&
                weekStart === ProjectWeekStartEnum.Sunday
              ? DetailUnitEnum.WeeksSunday
              : timeSpec === TimeSpecEnum.Days
                ? DetailUnitEnum.Days
                : timeSpec === TimeSpecEnum.Hours
                  ? DetailUnitEnum.Hours
                  : timeSpec === TimeSpecEnum.Minutes
                    ? DetailUnitEnum.Minutes
                    : timeSpec === TimeSpecEnum.Timestamps
                      ? DetailUnitEnum.Timestamps
                      : undefined;

  return timeSpecDetail;
}
