import { TimeframeEnum } from '~common/enums/timeframe.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';

export function getTimeSpecWord(item: { timeSpec: TimeSpecEnum }) {
  let { timeSpec } = item;

  let timeSpecWord =
    timeSpec === TimeSpecEnum.Years
      ? TimeframeEnum.Year
      : timeSpec === TimeSpecEnum.Quarters
        ? TimeframeEnum.Quarter
        : timeSpec === TimeSpecEnum.Months
          ? TimeframeEnum.Month
          : timeSpec === TimeSpecEnum.Weeks
            ? TimeframeEnum.Week
            : timeSpec === TimeSpecEnum.Days
              ? TimeframeEnum.Date
              : timeSpec === TimeSpecEnum.Hours
                ? TimeframeEnum.Hour
                : timeSpec === TimeSpecEnum.Minutes
                  ? TimeframeEnum.Minute
                  : timeSpec === TimeSpecEnum.Timestamps
                    ? TimeframeEnum.Ts
                    : undefined;

  return timeSpecWord;
}
