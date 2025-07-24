import {
  AgoMoment,
  FromNowMoment,
  Moment,
  UnitMoment,
  WeekdayMoment,
  WhichdayMoment
} from '@malloydata/malloy-filter';

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

  return momentStr;
}
