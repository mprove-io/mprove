import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import type { DetailUnit } from '#common/types/blockml/parts/field/detail-unit';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export function getTimeSpecDetail(item: {
  timeSpec: TimeSpec;
  weekStart: ProjectWeekStart;
}) {
  let { timeSpec, weekStart } = item;

  let timeSpecDetail: DetailUnit =
    timeSpec === 'years'
      ? 'years'
      : timeSpec === 'quarters'
        ? 'quarters'
        : timeSpec === 'months'
          ? 'months'
          : timeSpec === 'weeks' && weekStart === 'Monday'
            ? 'weeksMonday'
            : timeSpec === 'weeks' && weekStart === 'Sunday'
              ? 'weeksSunday'
              : timeSpec === 'days'
                ? 'days'
                : timeSpec === 'hours'
                  ? 'hours'
                  : timeSpec === 'minutes'
                    ? 'minutes'
                    : timeSpec === 'timestamps'
                      ? 'timestamps'
                      : undefined;

  return timeSpecDetail;
}
