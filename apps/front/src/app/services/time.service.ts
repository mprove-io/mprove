import { Injectable } from '@angular/core';
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
        : fraction.tsMomentType === common.FractionTsMomentTypeEnum.Today
          ? 'today'
          : fraction.tsMomentType === common.FractionTsMomentTypeEnum.Yesterday
            ? 'yesterday'
            : fraction.tsMomentType === common.FractionTsMomentTypeEnum.Tomorrow
              ? 'tomorrow'
              : fraction.tsMomentType === common.FractionTsMomentTypeEnum.This
                ? `this ${fraction.tsMomentUnit}`
                : fraction.tsMomentType === common.FractionTsMomentTypeEnum.Last
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

  buildFractionBeginFor(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { dateValue, timeValue, fraction } = item;

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
}
