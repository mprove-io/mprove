import { enums } from '~common/barrels/enums';

export function getTimeSpecDetail(item: { timeSpec: enums.TimeSpecEnum }) {
  let { timeSpec } = item;

  let timeSpecDetail =
    timeSpec === enums.TimeSpecEnum.Years
      ? enums.DetailUnitEnum.Years
      : timeSpec === enums.TimeSpecEnum.Quarters
      ? enums.DetailUnitEnum.Quarters
      : timeSpec === enums.TimeSpecEnum.Months
      ? enums.DetailUnitEnum.Months
      : timeSpec === enums.TimeSpecEnum.Weeks
      ? enums.DetailUnitEnum.Weeks
      : timeSpec === enums.TimeSpecEnum.Days
      ? enums.DetailUnitEnum.Days
      : timeSpec === enums.TimeSpecEnum.Hours
      ? enums.DetailUnitEnum.Hours
      : timeSpec === enums.TimeSpecEnum.Minutes
      ? enums.DetailUnitEnum.Minutes
      : timeSpec === enums.TimeSpecEnum.Timestamps
      ? enums.DetailUnitEnum.Timestamps
      : undefined;

  return timeSpecDetail;
}
