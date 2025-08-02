import { Injectable } from '@angular/core';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { common } from '~front/barrels/common';
import { StructQuery } from '../queries/struct.query';

@Injectable({ providedIn: 'root' })
export class TimeService {
  constructor(private structQuery: StructQuery) {}

  timeAgoFromNow(ts: number) {
    let time = new Date(ts).getTime();

    let now = new Date().getTime();

    let seconds = Math.floor((now - time) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
      return interval + ' years ago';
    }

    interval = Math.floor(seconds / 2592000);

    if (interval >= 1) {
      return interval + ' months ago';
    }

    interval = Math.floor(seconds / 86400);

    if (interval >= 1) {
      return interval + ' days ago';
    }

    interval = Math.floor(seconds / 3600);

    if (interval >= 1) {
      return interval + ' hours ago';
    }

    interval = Math.floor(seconds / 60);

    if (interval >= 1) {
      return interval + ' minutes ago';
    }

    return 'less than a minute ago';
  }

  secondsAgoFromNow(ts: number) {
    let time = new Date(ts).getTime();

    let now = new Date().getTime();

    let seconds = Math.floor((now - time) / 1000);

    return seconds;
  }

  getYearStr(item: { dateValue: string }) {
    let year = item.dateValue.split('-')[0];

    return `${year}`;
  }

  getMonthStr(item: { dateValue: string; dateSeparator: string }) {
    let year = item.dateValue.split('-')[0];
    let month = item.dateValue.split('-')[1];

    return `${year}${item.dateSeparator}${month}`;
  }

  getQuarterStr(item: { dateValue: string; dateSeparator: string }) {
    let year = item.dateValue.split('-')[0];
    let month = item.dateValue.split('-')[1];

    let quarter =
      [1, 2, 3].indexOf(Number(month)) > -1
        ? '1'
        : [4, 5, 6].indexOf(Number(month)) > -1
          ? '2'
          : [7, 8, 9].indexOf(Number(month)) > -1
            ? '3'
            : [10, 11, 12].indexOf(Number(month)) > -1
              ? '4'
              : undefined;

    return `${year}${item.dateSeparator}Q${quarter}`;
  }

  getWeekStr(item: { dateValue: string; dateSeparator: string }) {
    let date = item.dateValue.split('-').join(item.dateSeparator);

    return `${date}-WK`;
  }

  getDayStr(item: { dateValue: string; dateSeparator: string }) {
    let date = item.dateValue.split('-').join(item.dateSeparator);

    return `${date}`;
  }

  getHourStr(item: {
    dateValue: string;
    timeValue: string;
    dateSeparator: string;
  }) {
    let date = item.dateValue.split('-').join(item.dateSeparator);
    let hour = item.timeValue.split(':')[0];

    return `${date} ${hour}`;
  }

  getMinuteStr(item: {
    dateValue: string;
    timeValue: string;
    dateSeparator: string;
  }) {
    let date = item.dateValue.split('-').join(item.dateSeparator);
    let hour = item.timeValue.split(':')[0];
    let minute = item.timeValue.split(':')[1];

    return `${date} ${hour}:${minute}`;
  }

  getTimestampUtc(): string {
    const now: Date = new Date();

    const year: number = now.getUTCFullYear();
    const month: string = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day: string = String(now.getUTCDate()).padStart(2, '0');
    const hours: string = String(now.getUTCHours()).padStart(2, '0');
    const minutes: string = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds: string = String(now.getUTCSeconds()).padStart(2, '0');
    const milliseconds: string = String(now.getUTCMilliseconds()).padStart(
      3,
      '0'
    );

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  getDateTimeStrFromEpochMs(item: { ts: number }) {
    let ts = item.ts;

    let date = new Date(ts);

    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1; // Months are zero-based in JavaScript
    let day = date.getUTCDate();
    let hour = date.getUTCHours();
    let minute = date.getUTCMinutes();
    let second = 0;

    let monthD = month.toString().length === 1 ? `0${month}` : `${month}`;
    let dayD = day.toString().length === 1 ? `0${day}` : `${day}`;
    let hourD = hour.toString().length === 1 ? `0${hour}` : `${hour}`;
    let minuteD = minute.toString().length === 1 ? `0${minute}` : `${minute}`;
    let secondD = second.toString().length === 1 ? `0${second}` : `${second}`;

    let dateStr = `${year}-${monthD}-${dayD}`;
    let timeStr = `${hourD}:${minuteD}:${secondD}`;

    let dateUtcMs = new Date(`${dateStr}T00:00:00Z`).getTime();

    return { date, dateStr, timeStr, dateUtcMs };
  }

  getMomentStr(item: { fraction: common.Fraction; dateMinuteStr: string }) {
    let { fraction, dateMinuteStr } = item;

    let momentStr =
      fraction.tsMomentType === common.FractionTsMomentTypeEnum.Literal
        ? dateMinuteStr
        : fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? dateMinuteStr
          : fraction.tsMomentType === common.FractionTsMomentTypeEnum.Today
            ? 'today'
            : fraction.tsMomentType ===
                common.FractionTsMomentTypeEnum.Yesterday
              ? 'yesterday'
              : fraction.tsMomentType ===
                  common.FractionTsMomentTypeEnum.Tomorrow
                ? 'tomorrow'
                : fraction.tsMomentType === common.FractionTsMomentTypeEnum.This
                  ? `this ${fraction.tsMomentUnit}`
                  : fraction.tsMomentType ===
                      common.FractionTsMomentTypeEnum.Last
                    ? `last ${fraction.tsMomentUnit}`
                    : fraction.tsMomentType ===
                        common.FractionTsMomentTypeEnum.Next
                      ? `next ${fraction.tsMomentUnit}`
                      : fraction.tsMomentType ===
                          common.FractionTsMomentTypeEnum.LastDayOfWeek
                        ? `last ${fraction.tsMomentPartValue}`
                        : fraction.tsMomentType ===
                            common.FractionTsMomentTypeEnum.NextDayOfWeek
                          ? `next ${fraction.tsMomentPartValue}`
                          : fraction.tsMomentType ===
                              common.FractionTsMomentTypeEnum.Now
                            ? 'now'
                            : fraction.tsMomentType ===
                                common.FractionTsMomentTypeEnum.Ago
                              ? `${fraction.tsMomentAgoFromNowQuantity} ${fraction.tsMomentUnit}s ago`
                              : fraction.tsMomentType ===
                                  common.FractionTsMomentTypeEnum.FromNow
                                ? `${fraction.tsMomentAgoFromNowQuantity} ${fraction.tsMomentUnit}s from now`
                                : undefined;

    return momentStr;
  }

  getWeekStartDate(item: { dateValue: string }) {
    let { dateValue } = item;

    let structState = this.structQuery.getValue();

    let firstDayOfWeek =
      structState.weekStart === common.ProjectWeekStartEnum.Monday ? 1 : 0;

    let wDate = new Date(`${dateValue}T00:00:00Z`);

    let wDay = wDate.getUTCDay(); // 0 (Sunday) to 6 (Saturday)

    let wDiff = (wDay < firstDayOfWeek ? 7 : 0) + wDay - firstDayOfWeek;

    wDate.setUTCDate(wDate.getUTCDate() - wDiff);

    let value = wDate.toISOString().split('T')[0];

    return value;
  }

  getQuarterStartDate(item: { dateValue: string }) {
    let { dateValue } = item;

    let year = dateValue.split('-')[0];
    let month = dateValue.split('-')[1];

    let newMonth =
      [1, 2, 3].indexOf(Number(month)) > -1
        ? '01'
        : [4, 5, 6].indexOf(Number(month)) > -1
          ? '04'
          : [7, 8, 9].indexOf(Number(month)) > -1
            ? '07'
            : [10, 11, 12].indexOf(Number(month)) > -1
              ? '10'
              : undefined;

    return `${year}-${newMonth}-01`;
  }

  buildFractionAny(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let mBrick = MALLOY_FILTER_ANY;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAnyValue
    };

    return newFraction;
  }

  buildFractionLast(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let mBrick =
      fraction.tsLastCompleteOption ===
      common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
        ? `f\`${fraction.tsLastValue} ${fraction.tsLastUnit}\``
        : fraction.tsLastCompleteOption ===
            common.FractionTsLastCompleteOptionEnum.Complete
          ? `f\`last ${fraction.tsLastValue} ${fraction.tsLastUnit}\``
          : `f\`${fraction.tsLastValue} ${fraction.tsLastUnit} ago to now\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick)
        ? mBrick
        : fraction.tsLastCompleteOption ===
            common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
          ? `last ${fraction.tsLastValue} ${fraction.tsLastUnit}`
          : fraction.tsLastCompleteOption ===
              common.FractionTsLastCompleteOptionEnum.Complete
            ? `last ${fraction.tsLastValue} ${fraction.tsLastUnit} complete`
            : `last ${fraction.tsLastValue} ${fraction.tsLastUnit} complete plus current`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInLast,
      tsLastValue: fraction.tsLastValue,
      tsLastUnit: fraction.tsLastUnit,
      tsLastCompleteOption: fraction.tsLastCompleteOption
    };

    return newFraction;
  }

  buildFractionOnDay(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let dayStr = this.getDayStr({
      dateValue: dateValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: dayStr
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `on ${dayStr}`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionOnWeek(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let weekStr = this.getWeekStr({
      dateValue: dateValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: weekStr
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionOnMonth(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let monthStr = this.getMonthStr({
      dateValue: dateValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: monthStr
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `on ${monthStr}`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionOnQuarter(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let quarterStr = this.getQuarterStr({
      dateValue: dateValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: quarterStr
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionOnYear(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let yearStr = this.getYearStr({
      dateValue: dateValue
    });

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: yearStr
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `on ${yearStr}`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionNext(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let mBrick = `f\`next ${fraction.tsNextValue} ${fraction.tsNextUnit}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInNext,
      tsNextValue: fraction.tsNextValue,
      tsNextUnit: fraction.tsNextUnit
    };

    return newFraction;
  }

  buildFractionAfterDate(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`after ${dateMinuteStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAfterDate,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentPartValue: fraction.tsMomentPartValue,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionStarting(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`starting ${dateMinuteStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsStarting,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentPartValue: fraction.tsMomentPartValue,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionBeginFor(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { dateValue, timeValue, fraction } = item;

    let dateSeparator = common.isDefined(fraction.parentBrick) ? '-' : '/';

    let dateMinuteStr =
      fraction.tsMomentUnit === 'year'
        ? this.getYearStr({
            dateValue: dateValue
          })
        : fraction.tsMomentUnit === 'quarter'
          ? this.getQuarterStr({
              dateValue: dateValue,
              dateSeparator: dateSeparator
            })
          : fraction.tsMomentUnit === 'month'
            ? this.getMonthStr({
                dateValue: dateValue,
                dateSeparator: dateSeparator
              })
            : fraction.tsMomentUnit === 'week'
              ? this.getWeekStr({
                  dateValue: dateValue,
                  dateSeparator: dateSeparator
                })
              : fraction.tsMomentUnit === 'day'
                ? this.getDayStr({
                    dateValue: dateValue,
                    dateSeparator: dateSeparator
                  })
                : fraction.tsMomentUnit === 'hour'
                  ? this.getHourStr({
                      dateValue: dateValue,
                      timeValue: timeValue,
                      dateSeparator: dateSeparator
                    })
                  : fraction.tsMomentUnit === 'minute'
                    ? this.getMinuteStr({
                        dateValue: dateValue,
                        timeValue: timeValue,
                        dateSeparator: dateSeparator
                      })
                    : fraction.tsTimestampValue;

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: dateMinuteStr
    });

    let mBrick = `f\`${momentStr} for ${fraction.tsForValue} ${fraction.tsForUnit}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeginFor,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsTimestampValue: fraction.tsTimestampValue,
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentPartValue: fraction.tsMomentPartValue,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      tsMomentUnit: fraction.tsMomentUnit,
      tsForValue: fraction.tsForValue,
      tsForUnit: fraction.tsForUnit
    };

    return newFraction;
  }

  buildFractionRange(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
    dateToValue: string;
    timeToValue: string;
  }) {
    let { fraction, dateValue, timeValue, dateToValue, timeToValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let minuteToStr = this.getMinuteStr({
      dateValue: dateToValue,
      timeValue: timeToValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteToStr =
      Number(timeToValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeToValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteToStr
        : minuteToStr.split(' ')[0];

    let mBrick = `f\`${dateMinuteStr} to ${dateMinuteToStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick)
        ? mBrick
        : `on ${minuteStr} to ${minuteToStr}`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsInRange,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsDateToYear: Number(dateToValue.split('-')[0]),
      tsDateToMonth: Number(dateToValue.split('-')[1].replace(/^0+/, '')),
      tsDateToDay: Number(dateToValue.split('-')[2].replace(/^0+/, '')),
      tsDateToHour: Number(timeToValue.split(':')[0].replace(/^0+/, '')),
      tsDateToMinute: Number(timeToValue.split(':')[1].replace(/^0+/, '')),
      tsFromMoment: undefined,
      tsFromMomentType: fraction.tsFromMomentType,
      tsFromMomentPartValue: fraction.tsFromMomentPartValue,
      tsFromMomentAgoFromNowQuantity: fraction.tsFromMomentAgoFromNowQuantity,
      tsFromMomentUnit: fraction.tsFromMomentUnit,
      tsToMoment: undefined,
      tsToMomentType: fraction.tsToMomentType,
      tsToMomentPartValue: fraction.tsToMomentPartValue,
      tsToMomentAgoFromNowQuantity: fraction.tsToMomentAgoFromNowQuantity,
      tsToMomentUnit: fraction.tsToMomentUnit
    };

    return newFraction;
  }

  buildFractionBeforeDate(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`before ${dateMinuteStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsBeforeDate,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentPartValue: fraction.tsMomentPartValue,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionThrough(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr =
      Number(timeValue.split(':')[0].replace(/^0+/, '')) > 0 ||
      Number(timeValue.split(':')[1].replace(/^0+/, '')) > 0
        ? minuteStr
        : minuteStr.split(' ')[0];

    let mBrick = `f\`through ${dateMinuteStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsThrough,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentPartValue: fraction.tsMomentPartValue,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionOnHour(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let hourStr = this.getHourStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateHourStr = hourStr;

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: dateHourStr
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `on ${hourStr}`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionOnMinute(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let minuteStr = this.getMinuteStr({
      dateValue: dateValue,
      timeValue: timeValue,
      dateSeparator: common.isDefined(fraction.parentBrick) ? '-' : '/'
    });

    let dateMinuteStr = minuteStr;

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: dateMinuteStr
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick)
        ? mBrick
        : `on ${minuteStr}`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit
    };

    return newFraction;
  }

  buildFractionOnTimestamp(item: {
    fraction: common.Fraction;
  }) {
    let { fraction } = item;

    let momentStr = this.getMomentStr({
      fraction: fraction,
      dateMinuteStr: fraction.tsTimestampValue
    });

    let mBrick = `f\`${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      tsTimestampValue:
        fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsTimestampValue
          : undefined,
      type: fraction.type,
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType
    };

    return newFraction;
  }

  buildFractionNull(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let mBrick = 'f`null`';

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `null`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsNull
    };

    return newFraction;
  }

  buildFractionNotNull(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let mBrick = 'f`not null`';

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `not null`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.And,
      type: common.FractionTypeEnum.TsIsNotNull
    };

    return newFraction;
  }
}
