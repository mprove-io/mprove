import { Injectable } from '@angular/core';
import { DatePickerDate } from '@vaadin/date-picker';
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
    let now: Date = new Date();

    let year: number = now.getUTCFullYear();
    let month: string = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    let day: string = String(now.getUTCDate()).padStart(2, '0');
    let hours: string = String(now.getUTCHours()).padStart(2, '0');
    let minutes: string = String(now.getUTCMinutes()).padStart(2, '0');
    let seconds: string = String(now.getUTCSeconds()).padStart(2, '0');
    let milliseconds: string = String(now.getUTCMilliseconds()).padStart(
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

  getMomentStr(item: {
    dateValue: string;
    timeValue: string;
    momentUnit: common.FractionTsMixUnitEnum;
    momentType: common.FractionTsMomentTypeEnum;
    momentAgoFromNowQuantity: number;
    timestampValue: string;
  }) {
    let {
      dateValue,
      timeValue,
      momentUnit,
      momentType,
      momentAgoFromNowQuantity,
      timestampValue
    } = item;

    let dateSeparator = '-';
    // let dateSeparator = common.isDefined(fraction.parentBrick) ? '-' : '/';

    let dateMinuteStr =
      momentUnit === 'year'
        ? this.getYearStr({
            dateValue: dateValue
          })
        : momentUnit === 'quarter'
          ? this.getQuarterStr({
              dateValue: dateValue,
              dateSeparator: dateSeparator
            })
          : momentUnit === 'month'
            ? this.getMonthStr({
                dateValue: dateValue,
                dateSeparator: dateSeparator
              })
            : momentUnit === 'week'
              ? this.getWeekStr({
                  dateValue: dateValue,
                  dateSeparator: dateSeparator
                })
              : momentUnit === 'day'
                ? this.getDayStr({
                    dateValue: dateValue,
                    dateSeparator: dateSeparator
                  })
                : momentUnit === 'hour'
                  ? this.getHourStr({
                      dateValue: dateValue,
                      timeValue: timeValue,
                      dateSeparator: dateSeparator
                    })
                  : momentUnit === 'minute'
                    ? this.getMinuteStr({
                        dateValue: dateValue,
                        timeValue: timeValue,
                        dateSeparator: dateSeparator
                      })
                    : timestampValue;

    let momentStr =
      momentType === common.FractionTsMomentTypeEnum.Literal
        ? dateMinuteStr
        : momentType === common.FractionTsMomentTypeEnum.Timestamp
          ? dateMinuteStr
          : momentType === common.FractionTsMomentTypeEnum.Today
            ? 'today'
            : momentType === common.FractionTsMomentTypeEnum.Yesterday
              ? 'yesterday'
              : momentType === common.FractionTsMomentTypeEnum.Tomorrow
                ? 'tomorrow'
                : momentType === common.FractionTsMomentTypeEnum.This
                  ? `this ${momentUnit}`
                  : momentType === common.FractionTsMomentTypeEnum.Last
                    ? `last ${momentUnit}`
                    : momentType === common.FractionTsMomentTypeEnum.Next
                      ? `next ${momentUnit}`
                      : momentType === common.FractionTsMomentTypeEnum.Now
                        ? 'now'
                        : momentType === common.FractionTsMomentTypeEnum.Ago
                          ? `${momentAgoFromNowQuantity} ${momentUnit}s ago`
                          : momentType ===
                              common.FractionTsMomentTypeEnum.FromNow
                            ? `${momentAgoFromNowQuantity} ${momentUnit}s from now`
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

  buildFraction(item: {
    fraction: common.Fraction;
    dateStr: string;
    timeStr: string;
    dateToStr: string;
    timeToStr: string;
  }) {
    let { fraction, dateStr, timeStr, dateToStr, timeToStr } = item;

    if (fraction.type === common.FractionTypeEnum.TsIsAnyValue) {
      fraction = this.buildFractionAny({
        fraction: fraction
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsInLast ||
      fraction.type === common.FractionTypeEnum.TsIsNotInLast
    ) {
      fraction = this.buildFractionInLast({
        fraction: fraction
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnDay ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnDay
    ) {
      fraction = this.buildFractionOnDay({
        fraction: fraction,
        dateValue: dateStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnWeek ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnWeek
    ) {
      fraction = this.buildFractionOnWeek({
        fraction: fraction,
        dateValue: dateStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnMonth ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnMonth
    ) {
      fraction = this.buildFractionOnMonth({
        fraction: fraction,
        dateValue: dateStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnQuarter ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnQuarter
    ) {
      fraction = this.buildFractionOnQuarter({
        fraction: fraction,
        dateValue: dateStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnYear ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnYear
    ) {
      fraction = this.buildFractionOnYear({
        fraction: fraction,
        dateValue: dateStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsInNext ||
      fraction.type === common.FractionTypeEnum.TsIsNotInNext
    ) {
      fraction = this.buildFractionInNext({
        fraction: fraction
      });
    } else if (fraction.type === common.FractionTypeEnum.TsIsAfter) {
      fraction = this.buildFractionAfter({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr
      });
    } else if (fraction.type === common.FractionTypeEnum.TsIsStarting) {
      fraction = this.buildFractionStarting({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsBeginFor ||
      fraction.type === common.FractionTypeEnum.TsIsNotBeginFor
    ) {
      fraction = this.buildFractionBeginFor({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsBetween ||
      fraction.type === common.FractionTypeEnum.TsIsNotBetween
    ) {
      fraction = this.buildFractionBetween({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr,
        dateToValue: dateToStr,
        timeToValue: timeToStr
      });
    } else if (fraction.type === common.FractionTypeEnum.TsIsBefore) {
      fraction = this.buildFractionBefore({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr
      });
    } else if (fraction.type === common.FractionTypeEnum.TsIsThrough) {
      fraction = this.buildFractionThrough({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnHour ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnHour
    ) {
      fraction = this.buildFractionOnHour({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnMinute ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnMinute
    ) {
      fraction = this.buildFractionOnMinute({
        fraction: fraction,
        dateValue: dateStr,
        timeValue: timeStr
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsOnTimestamp ||
      fraction.type === common.FractionTypeEnum.TsIsNotOnTimestamp
    ) {
      fraction = this.buildFractionOnTimestamp({
        fraction: fraction
      });
    } else if (
      fraction.type === common.FractionTypeEnum.TsIsNull ||
      fraction.type === common.FractionTypeEnum.TsIsNotNull
    ) {
      fraction = this.buildFractionIsNull({
        fraction: fraction
      });
    }

    return fraction;
  }

  buildFractionAny(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let mBrick = MALLOY_FILTER_ANY;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type
    };

    return newFraction;
  }

  buildFractionInLast(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsInLast
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick =
      fraction.tsLastCompleteOption ===
      common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
        ? `f\`${operatorPrefix}${fraction.tsLastValue} ${fraction.tsLastUnit}\``
        : fraction.tsLastCompleteOption ===
            common.FractionTsLastCompleteOptionEnum.Complete
          ? `f\`${operatorPrefix}last ${fraction.tsLastValue} ${fraction.tsLastUnit}\``
          : MALLOY_FILTER_ANY;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
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

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: undefined,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnDay
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionOnWeek(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: undefined,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnWeek
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionOnMonth(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: undefined,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnMonth
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    // console.log('mBrick');
    // console.log(mBrick);

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionOnQuarter(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: undefined,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnQuarter
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionOnYear(item: {
    fraction: common.Fraction;
    dateValue: string;
  }) {
    let { fraction, dateValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: undefined,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnYear
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionInNext(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsInNext
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}next ${fraction.tsNextValue} ${fraction.tsNextUnit}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsNextValue: fraction.tsNextValue,
      tsNextUnit: fraction.tsNextUnit
    };

    return newFraction;
  }

  buildFractionAfter(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let mBrick = `f\`after ${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsTimestampValue:
        fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsTimestampValue
          : undefined,
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionStarting(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let mBrick = `f\`starting ${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsTimestampValue:
        fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsTimestampValue
          : undefined,
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionBeginFor(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { dateValue, timeValue, fraction } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsBeginFor
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr} for ${fraction.tsForValue} ${fraction.tsForUnit}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsTimestampValue:
        fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsTimestampValue
          : undefined,
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      tsForValue: fraction.tsForValue,
      tsForUnit: fraction.tsForUnit
    };

    return newFraction;
  }

  buildFractionBetween(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
    dateToValue: string;
    timeToValue: string;
  }) {
    let { fraction, dateValue, timeValue, dateToValue, timeToValue } = item;

    let momentFromStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsFromMomentUnit,
      momentType: fraction.tsFromMomentType,
      momentAgoFromNowQuantity: fraction.tsFromMomentAgoFromNowQuantity,
      timestampValue: fraction.tsFromTimestampValue
    });

    let momentToStr = this.getMomentStr({
      dateValue: dateToValue,
      timeValue: timeToValue,
      momentUnit: fraction.tsToMomentUnit,
      momentType: fraction.tsToMomentType,
      momentAgoFromNowQuantity: fraction.tsToMomentAgoFromNowQuantity,
      timestampValue: fraction.tsToTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsBetween
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentFromStr} to ${momentToStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsFromTimestampValue:
        fraction.tsFromMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsFromTimestampValue
          : undefined,
      tsDateToYear: Number(dateToValue.split('-')[0]),
      tsDateToMonth: Number(dateToValue.split('-')[1].replace(/^0+/, '')),
      tsDateToDay: Number(dateToValue.split('-')[2].replace(/^0+/, '')),
      tsDateToHour: Number(timeToValue.split(':')[0].replace(/^0+/, '')),
      tsDateToMinute: Number(timeToValue.split(':')[1].replace(/^0+/, '')),
      tsToTimestampValue:
        fraction.tsToMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsToTimestampValue
          : undefined,
      tsFromMoment: undefined,
      tsFromMomentType: fraction.tsFromMomentType,
      tsFromMomentAgoFromNowQuantity: fraction.tsFromMomentAgoFromNowQuantity,
      tsFromMomentUnit: fraction.tsFromMomentUnit,
      tsToMoment: undefined,
      tsToMomentType: fraction.tsToMomentType,
      tsToMomentAgoFromNowQuantity: fraction.tsToMomentAgoFromNowQuantity,
      tsToMomentUnit: fraction.tsToMomentUnit
    };

    return newFraction;
  }

  buildFractionBefore(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let mBrick = `f\`before ${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsTimestampValue:
        fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsTimestampValue
          : undefined,
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionThrough(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let mBrick = `f\`through ${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: common.FractionOperatorEnum.Or,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsTimestampValue:
        fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsTimestampValue
          : undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionOnHour(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnHour
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionOnMinute(item: {
    fraction: common.Fraction;
    dateValue: string;
    timeValue: string;
  }) {
    let { fraction, dateValue, timeValue } = item;

    let momentStr = this.getMomentStr({
      dateValue: dateValue,
      timeValue: timeValue,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnMinute
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsDateYear: Number(dateValue.split('-')[0]),
      tsDateMonth: Number(dateValue.split('-')[1].replace(/^0+/, '')),
      tsDateDay: Number(dateValue.split('-')[2].replace(/^0+/, '')),
      tsDateHour: Number(timeValue.split(':')[0].replace(/^0+/, '')),
      tsDateMinute: Number(timeValue.split(':')[1].replace(/^0+/, '')),
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType,
      tsMomentUnit: fraction.tsMomentUnit,
      tsMomentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity
    };

    return newFraction;
  }

  buildFractionOnTimestamp(item: {
    fraction: common.Fraction;
  }) {
    let { fraction } = item;

    let momentStr = this.getMomentStr({
      dateValue: undefined,
      timeValue: undefined,
      momentUnit: fraction.tsMomentUnit,
      momentType: fraction.tsMomentType,
      momentAgoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
      timestampValue: fraction.tsTimestampValue
    });

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsOnTimestamp
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let operatorPrefix =
      fractionOperator === common.FractionOperatorEnum.Or ? '' : 'not ';

    let mBrick = `f\`${operatorPrefix}${momentStr}\``;

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type,
      tsTimestampValue:
        fraction.tsMomentType === common.FractionTsMomentTypeEnum.Timestamp
          ? fraction.tsTimestampValue
          : undefined,
      tsMoment: undefined,
      tsMomentType: fraction.tsMomentType
    };

    return newFraction;
  }

  buildFractionIsNull(item: { fraction: common.Fraction }) {
    let { fraction } = item;

    let fractionOperator =
      fraction.type === common.FractionTypeEnum.TsIsNull
        ? common.FractionOperatorEnum.Or
        : common.FractionOperatorEnum.And;

    let mBrick =
      fractionOperator === common.FractionOperatorEnum.Or
        ? 'f`null`'
        : 'f`not null`';

    let newFraction: common.Fraction = {
      brick: common.isDefined(fraction.parentBrick) ? mBrick : `any`,
      parentBrick: common.isDefined(fraction.parentBrick) ? mBrick : undefined,
      operator: fractionOperator,
      type: fraction.type
    };

    return newFraction;
  }

  momentFormatDate(item: {
    d: DatePickerDate;
    momentUnit: common.FractionTsMixUnitEnum;
  }) {
    let { momentUnit, d } = item;

    if (momentUnit === 'year') {
      return `${d.year}`;
    } else if (momentUnit === 'quarter') {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

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

      return `${d.year}-Q${quarter}`;
    } else if (momentUnit === 'month') {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      return `${d.year}-${month}`;
    } else if (momentUnit === 'week') {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      let day = d.day.toString().length === 1 ? `0${d.day}` : `${d.day}`;

      return `${d.year}-${month}-${day}-WK`;
    } else {
      let monthIndex = d.month + 1;
      let month =
        monthIndex.toString().length === 1 ? `0${monthIndex}` : `${monthIndex}`;

      let day = d.day.toString().length === 1 ? `0${d.day}` : `${d.day}`;

      return `${d.year}-${month}-${day}`;
    }
  }
}
