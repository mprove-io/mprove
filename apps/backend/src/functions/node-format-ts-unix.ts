import type { TimeSpec } from '#common/types/shared/time/timespec';
// function content is the same as frontFormatTsUnix

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export function nodeFormatTsUnix(item: {
  timeSpec: TimeSpec;
  unixTimeZoned: number;
}) {
  let { timeSpec, unixTimeZoned } = item;

  let date = dayjs.unix(unixTimeZoned).utc();

  return timeSpec === 'years'
    ? date.format('YYYY') // format(date, 'yyyy')
    : timeSpec === 'quarters'
      ? 'Q' + date.format('Q YYYY') // format(date, 'QQQ yyyy')
      : timeSpec === 'months'
        ? date.format('MMM YYYY') // format(date, 'MMM yyyy')
        : timeSpec === 'weeks'
          ? date.format('DD MMM YYYY') // format(date, 'dd MMM yyyy')
          : timeSpec === 'days'
            ? date.format('DD MMM YYYY') // format(date, 'dd MMM yyyy')
            : timeSpec === 'hours'
              ? date.format('HH:mm DD MMM YYYY') // format(date, 'HH:mm dd MMM yyyy')
              : timeSpec === 'minutes'
                ? date.format('HH:mm DD MMM YYYY') // format(date, 'HH:mm dd MMM yyyy')
                : timeSpec === 'timestamps' // not *_ts
                  ? date.format('HH:mm:ss.SSS DD MMM YYYY') //
                  : `${unixTimeZoned}`;
}
