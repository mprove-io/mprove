import {
  AgoMoment,
  FromNowMoment,
  Moment,
  UnitMoment,
  WeekdayMoment,
  WhichdayMoment
} from '@malloydata/malloy-filter';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { FractionTsMomentType } from '#common/types/blockml/parts/fraction/fraction-ts-moment-type';

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

  let momentType: FractionTsMomentType =
    moment.moment === 'literal' && isUndefined(moment.units)
      ? 'Timestamp'
      : moment.moment === 'literal'
        ? 'Literal'
        : moment.moment === 'today'
          ? 'Today'
          : moment.moment === 'yesterday'
            ? 'Yesterday'
            : moment.moment === 'tomorrow'
              ? 'Tomorrow'
              : moment.moment === 'this'
                ? 'This'
                : moment.moment === 'last'
                  ? 'Last'
                  : moment.moment === 'next'
                    ? 'Next'
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
                        ? 'Last'
                        : (moment as WeekdayMoment).which === 'next'
                          ? 'Next'
                          : undefined
                      : moment.moment === 'ago'
                        ? 'Ago'
                        : moment.moment === 'from_now'
                          ? 'FromNow'
                          : moment.moment === 'now'
                            ? 'Now'
                            : undefined;

  return { momentStr: momentStr, momentType: momentType };
}
