import { enums } from '~common/barrels/enums';

export function getTimeSpecWord(item: { timeSpec: enums.TimeSpecEnum }) {
  let { timeSpec } = item;

  let timeSpecWord =
    timeSpec === enums.TimeSpecEnum.Years
      ? enums.TimeframeEnum.Year
      : timeSpec === enums.TimeSpecEnum.Quarters
      ? enums.TimeframeEnum.Quarter
      : timeSpec === enums.TimeSpecEnum.Months
      ? enums.TimeframeEnum.Month
      : timeSpec === enums.TimeSpecEnum.Weeks
      ? enums.TimeframeEnum.Week
      : timeSpec === enums.TimeSpecEnum.Days
      ? enums.TimeframeEnum.Date
      : timeSpec === enums.TimeSpecEnum.Hours
      ? enums.TimeframeEnum.Hour
      : timeSpec === enums.TimeSpecEnum.Minutes
      ? enums.TimeframeEnum.Minute
      : undefined;

  return timeSpecWord;
}
