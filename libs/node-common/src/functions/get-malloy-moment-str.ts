import {
  AgoMoment,
  FromNowMoment,
  Moment,
  UnitMoment,
  WeekdayMoment,
  WhichdayMoment
} from '@malloydata/malloy-filter';
import { common } from '~node-common/barrels/common';

export function getMalloyMomentStr(moment: Moment) {
  let momentStr =
    moment.moment === 'literal'
      ? moment.literal
      : [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
          ].includes(moment.moment)
        ? `${(moment as WeekdayMoment).which} ${(moment as WeekdayMoment).moment}`
        : ['yesterday', 'today', 'tomorrow'].includes(moment.moment)
          ? `${(moment as WhichdayMoment).moment}`
          : ['this', 'last', 'next'].includes(moment.moment)
            ? `${moment.moment} ${(moment as UnitMoment).units}`
            : moment.moment === 'ago'
              ? `${(moment as AgoMoment).n} ${(moment as AgoMoment).units}s ago`
              : moment.moment === 'from_now'
                ? `${(moment as FromNowMoment).n} ${(moment as FromNowMoment).units}s from now`
                : moment.moment === 'now'
                  ? moment.moment
                  : moment.moment;

  let momentType: common.FractionTsMomentTypeEnum =
    moment.moment === 'literal' && common.isUndefined(moment.units)
      ? common.FractionTsMomentTypeEnum.Timestamp
      : moment.moment === 'literal'
        ? common.FractionTsMomentTypeEnum.Literal
        : moment.moment === 'today'
          ? common.FractionTsMomentTypeEnum.Today
          : moment.moment === 'yesterday'
            ? common.FractionTsMomentTypeEnum.Yesterday
            : moment.moment === 'tomorrow'
              ? common.FractionTsMomentTypeEnum.Tomorrow
              : moment.moment === 'this'
                ? common.FractionTsMomentTypeEnum.This
                : moment.moment === 'last'
                  ? common.FractionTsMomentTypeEnum.Last
                  : moment.moment === 'next'
                    ? common.FractionTsMomentTypeEnum.Next
                    : [
                          'monday',
                          'tuesday',
                          'wednesday',
                          'thursday',
                          'friday',
                          'saturday',
                          'sunday'
                        ].includes(moment.moment) === true
                      ? (moment as WeekdayMoment).which === 'last'
                        ? common.FractionTsMomentTypeEnum.Last
                        : (moment as WeekdayMoment).which === 'next'
                          ? common.FractionTsMomentTypeEnum.Next
                          : undefined
                      : moment.moment === 'ago'
                        ? common.FractionTsMomentTypeEnum.Ago
                        : moment.moment === 'from_now'
                          ? common.FractionTsMomentTypeEnum.FromNow
                          : moment.moment === 'now'
                            ? common.FractionTsMomentTypeEnum.Now
                            : undefined;

  return { momentStr: momentStr, momentType: momentType };
}
