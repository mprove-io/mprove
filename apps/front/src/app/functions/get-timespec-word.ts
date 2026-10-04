import type { Timeframe } from '#common/types/shared/time/timeframe';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export function getTimeSpecWord(item: { timeSpec: TimeSpec }) {
  let { timeSpec } = item;

  let timeSpecWord: Timeframe =
    timeSpec === 'years'
      ? 'year'
      : timeSpec === 'quarters'
        ? 'quarter'
        : timeSpec === 'months'
          ? 'month'
          : timeSpec === 'weeks'
            ? 'week'
            : timeSpec === 'days'
              ? 'date'
              : timeSpec === 'hours'
                ? 'hour'
                : timeSpec === 'minutes'
                  ? 'minute'
                  : timeSpec === 'timestamps'
                    ? 'ts'
                    : undefined;

  return timeSpecWord;
}
