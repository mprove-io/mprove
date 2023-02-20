import { format, fromUnixTime } from 'date-fns';
import { enums } from '~common/barrels/enums';

export function formatTs(item: {
  timeSpec: enums.TimeSpecEnum;
  unixTime: number;
}) {
  let { timeSpec, unixTime } = item;

  let date = fromUnixTime(unixTime);

  return timeSpec === enums.TimeSpecEnum.Years
    ? format(date, 'yyyy')
    : timeSpec === enums.TimeSpecEnum.Quarters
    ? format(date, 'QQQ yyyy')
    : timeSpec === enums.TimeSpecEnum.Months
    ? format(date, 'MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Weeks
    ? format(date, 'dd MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Days
    ? format(date, 'dd MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Hours
    ? format(date, 'HH:mm dd MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Minutes
    ? format(date, 'HH:mm dd MMM yyyy')
    : `${unixTime}`;
}
