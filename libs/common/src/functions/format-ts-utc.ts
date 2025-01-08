import { enums } from '~common/barrels/enums';

let dayjs = require('dayjs');
let utc = require('dayjs/plugin/utc');
let timezone = require('dayjs/plugin/timezone');
let customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export function formatTsUTC(item: {
  timeSpec: enums.TimeSpecEnum;
  unixTimeZoned: number;
}) {
  let { timeSpec, unixTimeZoned } = item;

  let date = dayjs.unix(unixTimeZoned).utc();

  return timeSpec === enums.TimeSpecEnum.Years
    ? date.format('YYYY') // format(date, 'yyyy')
    : timeSpec === enums.TimeSpecEnum.Quarters
    ? date.format('Q YYYY') // format(date, 'QQQ yyyy')
    : timeSpec === enums.TimeSpecEnum.Months
    ? date.format('MMM YYYY') // format(date, 'MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Weeks
    ? date.format('dd MMM YYYY') // format(date, 'dd MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Days
    ? date.format('DD MMM YYYY') // format(date, 'dd MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Hours
    ? date.format('HH:mm DD MMM YYYY') // format(date, 'HH:mm dd MMM yyyy')
    : timeSpec === enums.TimeSpecEnum.Minutes
    ? date.format('HH:mm DD MMM YYYY') // format(date, 'HH:mm dd MMM yyyy')
    : `${unixTimeZoned}`;
}
