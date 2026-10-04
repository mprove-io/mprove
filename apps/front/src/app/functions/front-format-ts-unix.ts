import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/customParseFormat';
import customParseFormat from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { TimeSpec } from '#common/types/shared/time/timespec';

// function content is the same as nodeFormatTsUnix

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export function frontFormatTsUnix(item: {
  timeSpec: TimeSpec;
  unixTimeZoned: number;
}) {
  let { timeSpec, unixTimeZoned } = item;

  let date = dayjs.unix(unixTimeZoned).utc();

  return timeSpec === 'years'
    ? date.format('YYYY')
    : timeSpec === 'quarters'
      ? 'Q' + date.format('Q YYYY')
      : timeSpec === 'months'
        ? date.format('MMM YYYY')
        : timeSpec === 'weeks'
          ? date.format('YYYY MMM DD')
          : timeSpec === 'days'
            ? date.format('YYYY MMM DD')
            : timeSpec === 'hours'
              ? date.format('YYYY MMM DD HH:mm')
              : timeSpec === 'minutes'
                ? date.format('YYYY MMM DD  HH:mm')
                : timeSpec === 'seconds'
                  ? date.format('YYYY MMM DD HH:mm:ss') //
                  : timeSpec === 'timestamps' // not *_ts
                    ? date.format('YYYY MMM DD HH:mm:ss.SSS') //
                    : `${unixTimeZoned}`;
}
