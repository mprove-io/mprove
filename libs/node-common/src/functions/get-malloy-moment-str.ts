import {
  AgoMoment,
  FromNowMoment,
  Moment,
  UnitMoment,
  WeekdayMoment,
  WhichdayMoment
} from '@malloydata/malloy-filter';
import { FractionTsMomentTypeEnum } from '#common/enums/fraction/fraction-ts-moment-type.enum';
import { isUndefined } from '#common/functions/is-undefined';

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

  let momentType: FractionTsMomentTypeEnum =
    moment.moment === 'literal' && isUndefined(moment.units)
      ? FractionTsMomentTypeEnum.Timestamp
      : moment.moment === 'literal'
        ? FractionTsMomentTypeEnum.Literal
        : moment.moment === 'today'
          ? FractionTsMomentTypeEnum.Today
          : moment.moment === 'yesterday'
            ? FractionTsMomentTypeEnum.Yesterday
            : moment.moment === 'tomorrow'
              ? FractionTsMomentTypeEnum.Tomorrow
              : moment.moment === 'this'
                ? FractionTsMomentTypeEnum.This
                : moment.moment === 'last'
                  ? FractionTsMomentTypeEnum.Last
                  : moment.moment === 'next'
                    ? FractionTsMomentTypeEnum.Next
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
                        ? FractionTsMomentTypeEnum.Last
                        : (moment as WeekdayMoment).which === 'next'
                          ? FractionTsMomentTypeEnum.Next
                          : undefined
                      : moment.moment === 'ago'
                        ? FractionTsMomentTypeEnum.Ago
                        : moment.moment === 'from_now'
                          ? FractionTsMomentTypeEnum.FromNow
                          : moment.moment === 'now'
                            ? FractionTsMomentTypeEnum.Now
                            : undefined;

  return { momentStr: momentStr, momentType: momentType };
}
