// function content is the same as frontFormatTsUnix

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { TimeSpecEnum } from '#common/enums/timespec.enum';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export function nodeFormatTsUnix(item: {
  timeSpec: TimeSpecEnum;
  unixTimeZoned: number;
}) {
  let { timeSpec, unixTimeZoned } = item;

  let date = dayjs.unix(unixTimeZoned).utc();

  return timeSpec === TimeSpecEnum.Years
    ? date.format('YYYY') // format(date, 'yyyy')
    : timeSpec === TimeSpecEnum.Quarters
      ? 'Q' + date.format('Q YYYY') // format(date, 'QQQ yyyy')
      : timeSpec === TimeSpecEnum.Months
        ? date.format('MMM YYYY') // format(date, 'MMM yyyy')
        : timeSpec === TimeSpecEnum.Weeks
          ? date.format('DD MMM YYYY') // format(date, 'dd MMM yyyy')
          : timeSpec === TimeSpecEnum.Days
            ? date.format('DD MMM YYYY') // format(date, 'dd MMM yyyy')
            : timeSpec === TimeSpecEnum.Hours
              ? date.format('HH:mm DD MMM YYYY') // format(date, 'HH:mm dd MMM yyyy')
              : timeSpec === TimeSpecEnum.Minutes
                ? date.format('HH:mm DD MMM YYYY') // format(date, 'HH:mm dd MMM yyyy')
                : timeSpec === TimeSpecEnum.Timestamps // not *_ts
                  ? date.format('HH:mm:ss.SSS DD MMM YYYY') //
                  : `${unixTimeZoned}`;
}
