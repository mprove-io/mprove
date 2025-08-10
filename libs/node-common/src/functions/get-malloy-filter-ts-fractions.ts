import {
  After,
  AgoMoment,
  Before,
  For,
  FromNowMoment,
  InMoment,
  JustUnits,
  Moment,
  NowMoment,
  Null,
  TemporalFilter,
  TemporalLiteral,
  To,
  UnitMoment,
  WeekdayMoment,
  WhichdayMoment,
  in_last
} from '@malloydata/malloy-filter';
import { add, fromUnixTime, getUnixTime, sub } from 'date-fns';
import { MALLOY_FILTER_ANY } from '~common/_index';
import { getFractionTsMixUnit } from '~common/functions/get-fraction-ts-mix-unit';
import { common } from '~node-common/barrels/common';
import { getCurrentUnitStartTs } from './get-current-unit-start-ts';
import { getMalloyMomentStr } from './get-malloy-moment-str';
import { getUnitDuration } from './get-unit-duration';
import { getUnixTimeFromDateParts } from './get-unix-time-from-date-parts';
import { getUnixTimeFromDayOfWeek } from './get-unix-time-from-day-of-week';
import { timeRangeMakeCurrentTimestamps } from './time-range-make-current-timestamps';

export function getMalloyFilterTsFractions(item: {
  parsed: TemporalFilter;
  parentBrick: string;
  isGetTimeRange: boolean;
  weekStart?: common.ProjectWeekStartEnum;
  timezone?: string;
}) {
  let { parsed, parentBrick, isGetTimeRange, timezone, weekStart } = item;

  // {value: 'in_last', label: 'last'},
  // {value: 'last', label: 'last complete'},
  // {value: 'next', label: 'next complete'},
  // {value: '-before', label: 'starting'},
  // {value: 'after', label: 'after'},
  // {value: 'before', label: 'before'},
  // {value: '-after', label: 'through'},
  // {value: 'in', label: 'is'},
  // {value: 'to', label: 'between'},
  // {value: 'null', label: 'null'},
  // {value: '-null', label: 'not null'},

  // is in last (completed with current) (completed)
  // is in next (completed)
  // is between           literal     last, this, next          [from ... to ...]
  // is starting          literal     last, this, next          [not before]
  // is starting ... for  literal     last, this, next          [begin ... for ...]
  // is after             literal     last, this, next
  // is before            literal     last, this, next
  // is through           literal     last, this, next          [not after]
  // is on Year           literal     last, this, next
  // is on Quarter        literal     last, this, next
  // is on Month          literal     last, this, next
  // is on Week           literal     last, this, next
  // is on Day            literal     last (yesterday), this (today), next (tomorrow), last Sunday, next Sunday, ...
  // is on Hour           literal     last, this, next
  // is on Minute         literal     last, this, next
  // is on Timestamp      literal     now
  // is any value
  // is null
  // is not null

  let rangeStart: number;
  let rangeEnd: number;
  // let rangeOpen: number;
  // let rangeClose: number;

  let timestampsResult =
    isGetTimeRange === true
      ? timeRangeMakeCurrentTimestamps({
          timezone: timezone,
          weekStart: weekStart
        })
      : undefined;

  let fractions: common.Fraction[] = [];

  let temporalFilters: TemporalFilter[] = [];

  if (parsed?.operator === 'or' || parsed?.operator === 'and') {
    // parsed is null for any
    temporalFilters = parsed.members;
  } else if (common.isDefined(parsed)) {
    temporalFilters = [parsed];
  } else {
    // temporal any
    let fraction: common.Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: common.FractionOperatorEnum.Or,
      type: common.FractionTypeEnum.TsIsAnyValue
    };

    fractions.push(fraction);
  }

  if (isGetTimeRange === true && temporalFilters.length !== 1) {
    throw new Error('isGetTimeRange true, fractions length must be equal to 1');
  }

  // export type TemporalFilter = Null | Before | After | To | For | JustUnits | in_last | InMoment | BooleanChain<TemporalFilter> | ClauseGroup<TemporalFilter>;
  temporalFilters
    .filter(
      temporalFilter =>
        [
          'null',
          'last',
          'in_last',
          'next',
          'before',
          'after',
          'to',
          'in',
          'for'
        ].indexOf(temporalFilter.operator) > -1
    )
    .forEach(temporalFilter => {
      // temporal main

      let fractionOperator =
        (temporalFilter as { not: boolean })?.not === true
          ? common.FractionOperatorEnum.And
          : common.FractionOperatorEnum.Or;

      let fraction: common.Fraction;

      if ((temporalFilter as Null).operator === 'null') {
        // temporal null (null)
        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? 'f`null`'
              : 'f`not null`',
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsNull
              : common.FractionTypeEnum.TsIsNotNull
        };
      } else if ((temporalFilter as JustUnits).operator === 'last') {
        // temporal last (completed)
        let tFilter = temporalFilter as JustUnits;

        let tsLastValue = Number(tFilter.n);
        let tsLastUnit = common.getFractionTsUnits(tFilter.units);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`last ${tFilter.n} ${tFilter.units}s\``
              : `f\`not last ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsInLast
              : common.FractionTypeEnum.TsIsNotInLast,
          tsLastValue: tsLastValue,
          tsLastUnit: tsLastUnit,
          tsLastCompleteOption: common.FractionTsLastCompleteOptionEnum.Complete
        };

        if (isGetTimeRange === true) {
          let currentUnitStartTs = getCurrentUnitStartTs({
            unit: tsLastUnit,
            timezone: timezone,
            weekStart: weekStart
          });

          let subDuration = getUnitDuration({
            value: tsLastValue,
            unit: tsLastUnit
          });

          rangeEnd = currentUnitStartTs;

          rangeStart = getUnixTime(sub(fromUnixTime(rangeEnd), subDuration));
        }
      } else if ((temporalFilter as in_last).operator === 'in_last') {
        // temporal in_last (completed with current)
        let tFilter = temporalFilter as in_last;

        let tsLastValue = Number(tFilter.n);
        let tsLastUnit = common.getFractionTsUnits(tFilter.units);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`${tFilter.n} ${tFilter.units}s\``
              : `f\`not ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsInLast
              : common.FractionTypeEnum.TsIsNotInLast,
          tsLastValue: tsLastValue,
          tsLastUnit: tsLastUnit,
          tsLastCompleteOption:
            common.FractionTsLastCompleteOptionEnum.CompleteWithCurrent
        };

        if (isGetTimeRange === true) {
          let currentUnitStartTs = getCurrentUnitStartTs({
            unit: tsLastUnit,
            timezone: timezone,
            weekStart: weekStart
          });

          let oneUnitDuration = getUnitDuration({
            value: 1,
            unit: tsLastUnit
          });

          rangeEnd = getUnixTime(
            add(fromUnixTime(currentUnitStartTs), oneUnitDuration)
          );

          let duration = getUnitDuration({
            value: tsLastValue,
            unit: tsLastUnit
          });

          rangeStart = getUnixTime(sub(fromUnixTime(rangeEnd), duration));
        }
      } else if ((temporalFilter as JustUnits).operator === 'next') {
        // temporal next (next completed)
        let tFilter = temporalFilter as JustUnits;

        let tsNextValue = Number(tFilter.n);
        let tsNextUnit = common.getFractionTsUnits(tFilter.units);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`next ${tFilter.n} ${tFilter.units}s\``
              : `f\`not next ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsInNext
              : common.FractionTypeEnum.TsIsNotInNext,
          tsNextValue: tsNextValue,
          tsNextUnit: tsNextUnit
        };

        if (isGetTimeRange === true) {
          let currentUnitStartTs = getCurrentUnitStartTs({
            unit: tsNextUnit,
            timezone: timezone,
            weekStart: weekStart
          });

          let oneUnitDuration = getUnitDuration({
            value: 1,
            unit: tsNextUnit
          });

          rangeStart = getUnixTime(
            add(fromUnixTime(currentUnitStartTs), oneUnitDuration)
          );

          let duration = getUnitDuration({
            value: tsNextValue,
            unit: tsNextUnit
          });

          rangeEnd = getUnixTime(add(fromUnixTime(rangeStart), duration));
        }
      } else if ((temporalFilter as Before).operator === 'before') {
        // temporal before (before)
        let tFilter = temporalFilter as Before;
        let before = tFilter.before;

        let { year, quarter, month, day, hour, minute } = common.parseTsLiteral(
          {
            input: (before as TemporalLiteral).literal,
            units: (before as TemporalLiteral).units
          }
        );

        let m = getMalloyMomentStr(tFilter.before);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`before ${m.momentStr}\``
              : `f\`starting ${m.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsBefore
              : common.FractionTypeEnum.TsIsStarting,
          tsMomentType: m.momentType,
          tsMoment: before,
          tsMomentAgoFromNowQuantity: common.isDefined(
            (before as AgoMoment | FromNowMoment).n
          )
            ? Number((before as AgoMoment | FromNowMoment).n)
            : undefined,
          tsMomentUnit:
            [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            ].includes(before.moment) === true &&
            ['last', 'next'].indexOf((before as WeekdayMoment).which) > -1
              ? getFractionTsMixUnit((before as WeekdayMoment).moment)
              : getFractionTsMixUnit(
                  (before as UnitMoment | AgoMoment | FromNowMoment).units
                ),
          tsTimestampValue:
            before.moment === 'literal' && common.isUndefined(before.units)
              ? before.literal
              : undefined,
          tsDateYear: common.isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: common.isDefined(quarter)
            ? Number(quarter)
            : undefined,
          tsDateMonth: common.isDefined(month) ? Number(month) : undefined,
          tsDateDay: common.isDefined(day) ? Number(day) : undefined,
          tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: common.isDefined(minute) ? Number(minute) : undefined
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            moment: before,
            agoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            timezone: timezone,
            weekStart: weekStart,
            currentTs: timestampsResult.currentTs
          });

          // console.log('start');
          // console.log(start);

          if (fraction.type === common.FractionTypeEnum.TsIsBefore) {
            rangeEnd = start.rangeStart;
          } else if (fraction.type === common.FractionTypeEnum.TsIsStarting) {
            rangeStart = start.rangeStart;
          }
        }

        // console.log('rangeStart');
        // console.log(rangeStart);

        // console.log('rangeEnd');
        // console.log(rangeEnd);
      } else if ((temporalFilter as After).operator === 'after') {
        // temporal after (after)
        let tFilter = temporalFilter as After;
        let after = tFilter.after;

        let { year, quarter, month, day, hour, minute } = common.parseTsLiteral(
          {
            input: (after as TemporalLiteral).literal,
            units: (after as TemporalLiteral).units
          }
        );

        let m = getMalloyMomentStr(tFilter.after);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`after ${m.momentStr}\``
              : `f\`through ${m.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsAfter
              : common.FractionTypeEnum.TsIsThrough,
          tsMomentType: m.momentType,
          tsMoment: after,
          tsMomentAgoFromNowQuantity: common.isDefined(
            (after as AgoMoment | FromNowMoment).n
          )
            ? Number((after as AgoMoment | FromNowMoment).n)
            : undefined,
          tsMomentUnit:
            [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            ].includes(after.moment) === true &&
            ['last', 'next'].indexOf((after as WeekdayMoment).which) > -1
              ? getFractionTsMixUnit((after as WeekdayMoment).moment)
              : getFractionTsMixUnit(
                  (after as UnitMoment | AgoMoment | FromNowMoment).units
                ),
          tsTimestampValue:
            after.moment === 'literal' && common.isUndefined(after.units)
              ? after.literal
              : undefined,
          tsDateYear: common.isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: common.isDefined(quarter)
            ? Number(quarter)
            : undefined,
          tsDateMonth: common.isDefined(month) ? Number(month) : undefined,
          tsDateDay: common.isDefined(day) ? Number(day) : undefined,
          tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: common.isDefined(minute) ? Number(minute) : undefined
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            moment: after,
            agoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            timezone: timezone,
            weekStart: weekStart,
            currentTs: timestampsResult.currentTs
          });

          // console.log('start');
          // console.log(start);

          if (fraction.type === common.FractionTypeEnum.TsIsAfter) {
            rangeStart = common.isUndefined(start.oneUnitDuration) // now, literal with no units
              ? start.rangeStart
              : getUnixTime(
                  add(fromUnixTime(start.rangeStart), start.oneUnitDuration)
                );
          } else if (fraction.type === common.FractionTypeEnum.TsIsThrough) {
            rangeEnd = common.isUndefined(start.oneUnitDuration) // now, literal with no units
              ? start.rangeStart
              : getUnixTime(
                  add(fromUnixTime(start.rangeStart), start.oneUnitDuration)
                );
          }

          // console.log('rangeStart');
          // console.log(rangeStart);

          // console.log('rangeEnd');
          // console.log(rangeEnd);
        }
      } else if ((temporalFilter as To).operator === 'to') {
        // temporal to (between)
        let tFilter = temporalFilter as To;
        let from = tFilter.fromMoment;
        let to = tFilter.toMoment;

        let { year, quarter, month, day, hour, minute } = common.parseTsLiteral(
          {
            input: (from as TemporalLiteral).literal,
            units: (from as TemporalLiteral).units
          }
        );

        let {
          year: toYear,
          quarter: toQuarter,
          month: toMonth,
          day: toDay,
          hour: toHour,
          minute: toMinute
        } = common.parseTsLiteral({
          input: (to as TemporalLiteral).literal,
          units: (to as TemporalLiteral).units
        });

        let mFrom = getMalloyMomentStr(tFilter.fromMoment);
        let mTo = getMalloyMomentStr(tFilter.toMoment);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`${mFrom.momentStr} to ${mTo.momentStr}\``
              : `f\`not ${mFrom.momentStr} to ${mTo.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsBetween
              : common.FractionTypeEnum.TsIsNotBetween,
          tsFromMomentType: mFrom.momentType,
          tsToMomentType: mTo.momentType,
          tsFromMoment: from,
          tsFromMomentAgoFromNowQuantity: common.isDefined(
            (from as AgoMoment | FromNowMoment).n
          )
            ? Number((from as AgoMoment | FromNowMoment).n)
            : undefined,
          tsFromMomentUnit:
            [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            ].includes(from.moment) === true &&
            ['last', 'next'].indexOf((from as WeekdayMoment).which) > -1
              ? getFractionTsMixUnit((from as WeekdayMoment).moment)
              : getFractionTsMixUnit(
                  (from as UnitMoment | AgoMoment | FromNowMoment).units
                ),
          tsFromTimestampValue:
            from.moment === 'literal' && common.isUndefined(from.units)
              ? from.literal
              : undefined,
          tsToMoment: to,
          tsToMomentAgoFromNowQuantity: common.isDefined(
            (to as AgoMoment | FromNowMoment).n
          )
            ? Number((to as AgoMoment | FromNowMoment).n)
            : undefined,
          tsToMomentUnit:
            [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            ].includes(to.moment) === true &&
            ['last', 'next'].indexOf((to as WeekdayMoment).which) > -1
              ? getFractionTsMixUnit((to as WeekdayMoment).moment)
              : getFractionTsMixUnit(
                  (to as UnitMoment | AgoMoment | FromNowMoment).units
                ),
          tsToTimestampValue:
            to.moment === 'literal' && common.isUndefined(to.units)
              ? to.literal
              : undefined,
          tsLastValue: undefined,
          tsLastUnit: undefined,
          tsLastCompleteOption: undefined,
          tsDateYear: common.isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: common.isDefined(quarter)
            ? Number(quarter)
            : undefined,
          tsDateMonth: common.isDefined(month) ? Number(month) : undefined,
          tsDateDay: common.isDefined(day) ? Number(day) : undefined,
          tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: common.isDefined(minute) ? Number(minute) : undefined,
          tsDateToYear: common.isDefined(toYear) ? Number(toYear) : undefined,
          tsDateToQuarter: common.isDefined(toQuarter)
            ? Number(toQuarter)
            : undefined,
          tsDateToMonth: common.isDefined(toMonth)
            ? Number(toMonth)
            : undefined,
          tsDateToDay: common.isDefined(toDay) ? Number(toDay) : undefined,
          tsDateToHour: common.isDefined(toHour) ? Number(toHour) : undefined,
          tsDateToMinute: common.isDefined(toMinute)
            ? Number(toMinute)
            : undefined
        };

        if (isGetTimeRange === true) {
          let fromStart = getStart({
            moment: from,
            agoFromNowQuantity: fraction.tsFromMomentAgoFromNowQuantity,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            timezone: timezone,
            weekStart: weekStart,
            currentTs: timestampsResult.currentTs
          });

          let toStart = getStart({
            moment: to,
            agoFromNowQuantity: fraction.tsToMomentAgoFromNowQuantity,
            year: toYear,
            month: toMonth,
            day: toDay,
            hour: toHour,
            minute: toMinute,
            timezone: timezone,
            weekStart: weekStart,
            currentTs: timestampsResult.currentTs
          });

          rangeStart = fromStart.rangeStart;
          rangeEnd = toStart.rangeStart;
        }
      } else if ((temporalFilter as InMoment).operator === 'in') {
        // temporal in (on)
        let tFilter = temporalFilter as InMoment;
        let tfIn = tFilter.in;

        let { year, quarter, month, day, hour, minute } = common.parseTsLiteral(
          {
            input: (tfIn as TemporalLiteral).literal,
            units: (tfIn as TemporalLiteral).units
          }
        );

        let m = getMalloyMomentStr(tfIn);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`${m.momentStr}\``
              : `f\`not ${m.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            (tfIn as TemporalLiteral).units === 'year'
              ? fractionOperator === common.FractionOperatorEnum.Or
                ? common.FractionTypeEnum.TsIsOnYear
                : common.FractionTypeEnum.TsIsNotOnYear
              : (tfIn as TemporalLiteral).units === 'quarter'
                ? fractionOperator === common.FractionOperatorEnum.Or
                  ? common.FractionTypeEnum.TsIsOnQuarter
                  : common.FractionTypeEnum.TsIsNotOnQuarter
                : (tfIn as TemporalLiteral).units === 'month'
                  ? fractionOperator === common.FractionOperatorEnum.Or
                    ? common.FractionTypeEnum.TsIsOnMonth
                    : common.FractionTypeEnum.TsIsNotOnMonth
                  : (tfIn as TemporalLiteral).units === 'week'
                    ? fractionOperator === common.FractionOperatorEnum.Or
                      ? common.FractionTypeEnum.TsIsOnWeek
                      : common.FractionTypeEnum.TsIsNotOnWeek
                    : (tfIn as TemporalLiteral).units === 'day' ||
                        ['today', 'yesterday', 'tomorrow'].indexOf(
                          (tfIn as WhichdayMoment).moment
                        ) > -1 ||
                        [
                          'sunday',
                          'monday',
                          'tuesday',
                          'wednesday',
                          'thursday',
                          'friday',
                          'saturday'
                        ].indexOf((tfIn as WeekdayMoment).moment) > -1
                      ? fractionOperator === common.FractionOperatorEnum.Or
                        ? common.FractionTypeEnum.TsIsOnDay
                        : common.FractionTypeEnum.TsIsNotOnDay
                      : (tfIn as TemporalLiteral).units === 'hour'
                        ? fractionOperator === common.FractionOperatorEnum.Or
                          ? common.FractionTypeEnum.TsIsOnHour
                          : common.FractionTypeEnum.TsIsNotOnHour
                        : (tfIn as TemporalLiteral).units === 'minute'
                          ? fractionOperator === common.FractionOperatorEnum.Or
                            ? common.FractionTypeEnum.TsIsOnMinute
                            : common.FractionTypeEnum.TsIsNotOnMinute
                          : tfIn.moment === 'literal' ||
                              (tfIn as NowMoment).moment === 'now'
                            ? fractionOperator ===
                              common.FractionOperatorEnum.Or
                              ? common.FractionTypeEnum.TsIsOnTimestamp
                              : common.FractionTypeEnum.TsIsNotOnTimestamp
                            : undefined,
          tsMomentType: m.momentType,
          tsMoment: tfIn,
          tsMomentAgoFromNowQuantity: common.isDefined(
            (tfIn as AgoMoment | FromNowMoment).n
          )
            ? Number((tfIn as AgoMoment | FromNowMoment).n)
            : undefined,
          tsMomentUnit:
            [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            ].includes(tfIn.moment) === true &&
            ['last', 'next'].indexOf((tfIn as WeekdayMoment).which) > -1
              ? getFractionTsMixUnit((tfIn as WeekdayMoment).moment)
              : getFractionTsMixUnit(
                  (tfIn as UnitMoment | AgoMoment | FromNowMoment).units
                ),
          tsTimestampValue:
            tfIn.moment === 'literal' && common.isUndefined(tfIn.units)
              ? tfIn.literal
              : undefined,
          tsDateYear: common.isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: common.isDefined(quarter)
            ? Number(quarter)
            : undefined,
          tsDateMonth: common.isDefined(month) ? Number(month) : undefined,
          tsDateDay: common.isDefined(day) ? Number(day) : undefined,
          tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: common.isDefined(minute) ? Number(minute) : undefined
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            moment: fraction.tsMoment,
            agoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            timezone: timezone,
            weekStart: weekStart,
            currentTs: timestampsResult.currentTs
          });

          rangeStart = start.rangeStart;

          rangeEnd = common.isUndefined(start.oneUnitDuration) // now, literal with no units // maybe no such case
            ? start.rangeStart
            : getUnixTime(add(fromUnixTime(rangeStart), start.oneUnitDuration));
        }
      } else if ((temporalFilter as For).operator === 'for') {
        // temporal for (begin ... for ...) [starts ... for ...]
        let tFilter = temporalFilter as For;
        let begin = tFilter.begin;

        let { year, quarter, month, day, hour, minute } = common.parseTsLiteral(
          {
            input: (begin as TemporalLiteral).literal,
            units: (begin as TemporalLiteral).units
          }
        );

        let m = getMalloyMomentStr(tFilter.begin);

        fraction = {
          brick:
            fractionOperator === common.FractionOperatorEnum.Or
              ? `f\`${m.momentStr} for ${tFilter.n} ${tFilter.units}s\``
              : `f\`not ${m.momentStr} for ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === common.FractionOperatorEnum.Or
              ? common.FractionTypeEnum.TsIsBeginFor
              : common.FractionTypeEnum.TsIsNotBeginFor,
          tsMomentType: m.momentType,
          tsMoment: begin,
          tsMomentAgoFromNowQuantity: common.isDefined(
            (begin as AgoMoment | FromNowMoment).n
          )
            ? Number((begin as AgoMoment | FromNowMoment).n)
            : undefined,
          tsMomentUnit:
            [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday'
            ].includes(begin.moment) === true &&
            ['last', 'next'].indexOf((begin as WeekdayMoment).which) > -1
              ? getFractionTsMixUnit((begin as WeekdayMoment).moment)
              : getFractionTsMixUnit(
                  (begin as UnitMoment | AgoMoment | FromNowMoment).units
                ),
          tsTimestampValue:
            begin.moment === 'literal' && common.isUndefined(begin.units)
              ? begin.literal
              : undefined,
          tsDateYear: common.isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: common.isDefined(quarter)
            ? Number(quarter)
            : undefined,
          tsDateMonth: common.isDefined(month) ? Number(month) : undefined,
          tsDateDay: common.isDefined(day) ? Number(day) : undefined,
          tsDateHour: common.isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: common.isDefined(minute) ? Number(minute) : undefined,
          tsForUnit: common.getFractionTsUnits(tFilter.units),
          tsForValue: Number(tFilter.n)
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            moment: fraction.tsMoment,
            agoFromNowQuantity: fraction.tsMomentAgoFromNowQuantity,
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            timezone: timezone,
            weekStart: weekStart,
            currentTs: timestampsResult.currentTs
          });

          let forDuration = getUnitDuration({
            value: fraction.tsForValue,
            unit: fraction.tsForUnit
          });

          rangeStart = start.rangeStart;

          rangeEnd = getUnixTime(add(fromUnixTime(rangeStart), forDuration));
        }
      }

      if (common.isDefined(fraction)) {
        fractions.push(fraction);
      }
    });

  return { fractions: fractions, rangeStart: rangeStart, rangeEnd: rangeEnd };
}

function getStart(item: {
  currentTs: number;
  moment: Moment;
  weekStart: common.ProjectWeekStartEnum;
  timezone: string;
  agoFromNowQuantity: number;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}) {
  let {
    currentTs,
    moment,
    timezone,
    weekStart,
    agoFromNowQuantity,
    year,
    month,
    day,
    hour,
    minute
  } = item;

  let unit =
    (moment as TemporalLiteral).units === 'year'
      ? common.FractionTsUnitEnum.Years
      : (moment as TemporalLiteral).units === 'quarter'
        ? common.FractionTsUnitEnum.Quarters
        : (moment as TemporalLiteral).units === 'month'
          ? common.FractionTsUnitEnum.Months
          : (moment as TemporalLiteral).units === 'week'
            ? common.FractionTsUnitEnum.Weeks
            : (moment as TemporalLiteral).units === 'day' ||
                ['today', 'yesterday', 'tomorrow'].indexOf(
                  (moment as WhichdayMoment).moment
                ) > -1 ||
                [
                  'sunday',
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday'
                ].indexOf((moment as WeekdayMoment).moment) > -1
              ? common.FractionTsUnitEnum.Days
              : (moment as TemporalLiteral).units === 'hour'
                ? common.FractionTsUnitEnum.Hours
                : (moment as TemporalLiteral).units === 'minute'
                  ? common.FractionTsUnitEnum.Minutes
                  : // : moment.moment === 'literal' ||
                    //     (moment as NowMoment).moment === 'now'
                    //   ? fractionOperator ===
                    //     common.FractionOperatorEnum.Or
                    //     ? common.FractionTypeEnum.TsIsOnTimestamp
                    //     : common.FractionTypeEnum.TsIsNotOnTimestamp
                    undefined;

  let currentUnitStartTs = getCurrentUnitStartTs({
    unit: unit,
    timezone: timezone,
    weekStart: weekStart
  });

  let oneUnitDuration = getUnitDuration({
    value: 1,
    unit: unit
  });

  let agoFromNowDuration = getUnitDuration({
    value: agoFromNowQuantity,
    unit: unit
  });

  // console.log('moment');
  // console.log(moment);

  let rangeStart =
    moment.moment === 'now'
      ? currentTs
      : moment.moment === 'literal' && common.isUndefined(moment.units)
        ? getUnixTime(new Date(moment.literal))
        : unit === common.FractionTsUnitEnum.Days &&
            [
              'sunday',
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday'
            ].indexOf((moment as WeekdayMoment).moment) > -1
          ? getUnixTimeFromDayOfWeek({
              weekday: (moment as WeekdayMoment).moment,
              lastNext: (moment as WeekdayMoment).which,
              currentUnitStartTs: currentUnitStartTs
            })
          : unit === common.FractionTsUnitEnum.Days && moment.moment === 'today'
            ? currentUnitStartTs
            : unit === common.FractionTsUnitEnum.Days &&
                moment.moment === 'yesterday'
              ? getUnixTime(
                  sub(fromUnixTime(currentUnitStartTs), oneUnitDuration)
                )
              : unit === common.FractionTsUnitEnum.Days &&
                  moment.moment === 'tomorrow'
                ? getUnixTime(
                    add(fromUnixTime(currentUnitStartTs), oneUnitDuration)
                  )
                : moment.moment === 'this'
                  ? currentUnitStartTs
                  : moment.moment === 'last'
                    ? getUnixTime(
                        sub(fromUnixTime(currentUnitStartTs), oneUnitDuration)
                      )
                    : moment.moment === 'next'
                      ? getUnixTime(
                          add(fromUnixTime(currentUnitStartTs), oneUnitDuration)
                        )
                      : moment.moment === 'ago'
                        ? getUnixTime(
                            sub(
                              fromUnixTime(currentUnitStartTs),
                              agoFromNowDuration
                            )
                          )
                        : moment.moment === 'from_now'
                          ? getUnixTime(
                              add(
                                fromUnixTime(currentUnitStartTs),
                                agoFromNowDuration
                              )
                            )
                          : moment.moment === 'literal'
                            ? getUnixTimeFromDateParts({
                                year: year,
                                month: month,
                                day: day,
                                hour: hour,
                                minute: minute
                              })
                            : undefined;

  return { rangeStart, unit, oneUnitDuration };
}
