import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/customParseFormat';
import customParseFormat from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { TimeSpecEnum } from '~common/enums/timespec.enum';

// function content is the same as nodeFormatTsUnix

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export function frontFormatTsUnix(item: {
  timeSpec: TimeSpecEnum;
  unixTimeZoned: number;
}) {
  let { timeSpec, unixTimeZoned } = item;

  let date = dayjs.unix(unixTimeZoned).utc();

  return timeSpec === TimeSpecEnum.Years
    ? date.format('YYYY')
    : timeSpec === TimeSpecEnum.Quarters
      ? 'Q' + date.format('Q YYYY')
      : timeSpec === TimeSpecEnum.Months
        ? date.format('MMM YYYY')
        : timeSpec === TimeSpecEnum.Weeks
          ? date.format('YYYY MMM DD')
          : timeSpec === TimeSpecEnum.Days
            ? date.format('YYYY MMM DD')
            : timeSpec === TimeSpecEnum.Hours
              ? date.format('YYYY MMM DD HH:mm')
              : timeSpec === TimeSpecEnum.Minutes
                ? date.format('YYYY MMM DD  HH:mm')
                : timeSpec === TimeSpecEnum.Seconds
                  ? date.format('YYYY MMM DD HH:mm:ss') //
                  : timeSpec === TimeSpecEnum.Timestamps // not *_ts
                    ? date.format('YYYY MMM DD HH:mm:ss.SSS') //
                    : `${unixTimeZoned}`;
}
