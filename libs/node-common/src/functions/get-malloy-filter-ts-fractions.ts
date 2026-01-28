import {
  After,
  AgoMoment,
  Before,
  For,
  FromNowMoment,
  InMoment,
  in_last,
  JustUnits,
  Moment,
  NowMoment,
  Null,
  TemporalFilter,
  TemporalLiteral,
  To,
  UnitMoment,
  WeekdayMoment,
  WhichdayMoment
} from '@malloydata/malloy-filter';
import { add, fromUnixTime, getUnixTime, sub } from 'date-fns';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTsLastCompleteOptionEnum } from '#common/enums/fraction/fraction-ts-last-complete-option.enum';
import { FractionTsUnitEnum } from '#common/enums/fraction/fraction-ts-unit.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { getFractionTsMixUnit } from '#common/functions/get-fraction-ts-mix-unit';
import { getFractionTsUnits } from '#common/functions/get-fraction-ts-units';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { parseTsLiteral } from '#common/functions/parse-ts-literal';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { getCurrentUnitStartTs } from './get-current-unit-start-ts';
import { getMalloyMomentStr } from './get-malloy-moment-str';
import { getTimeSpecUnitStartTs as getTimeSpecUnitMomentStartTs } from './get-timespec-unit-moment-start-ts';
import { getUnitDuration } from './get-unit-duration';
import { getUnixTimeFromDateParts } from './get-unix-time-from-date-parts';
import { getUnixTimeFromDayOfWeek } from './get-unix-time-from-day-of-week';
import { timeRangeMakeCurrentTimestamps } from './time-range-make-current-timestamps';

export function getMalloyFilterTsFractions(item: {
  parsed: TemporalFilter;
  parentBrick: string;
  isGetTimeRange: boolean;
  weekStart?: ProjectWeekStartEnum;
  timezone?: string;
  timeSpec?: TimeSpecEnum;
}) {
  let { parsed, parentBrick, isGetTimeRange, timezone, weekStart, timeSpec } =
    item;

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

  let fractions: Fraction[] = [];

  let temporalFilters: TemporalFilter[] = [];

  if (parsed?.operator === 'or' || parsed?.operator === 'and') {
    // parsed is null for any
    temporalFilters = parsed.members;
  } else if (isDefined(parsed)) {
    temporalFilters = [parsed];
  } else {
    // temporal any
    let fraction: Fraction = {
      brick: MALLOY_FILTER_ANY,
      parentBrick: parentBrick,
      operator: FractionOperatorEnum.Or,
      type: FractionTypeEnum.TsIsAnyValue
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
          ? FractionOperatorEnum.And
          : FractionOperatorEnum.Or;

      let fraction: Fraction;

      if ((temporalFilter as Null).operator === 'null') {
        // temporal null (null)
        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? 'f`null`'
              : 'f`not null`',
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsNull
              : FractionTypeEnum.TsIsNotNull
        };
      } else if ((temporalFilter as JustUnits).operator === 'last') {
        // temporal last (completed)
        let tFilter = temporalFilter as JustUnits;

        let tsLastValue = Number(tFilter.n);
        let tsLastUnit = getFractionTsUnits(tFilter.units);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`last ${tFilter.n} ${tFilter.units}s\``
              : `f\`not last ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsInLast
              : FractionTypeEnum.TsIsNotInLast,
          tsLastValue: tsLastValue,
          tsLastUnit: tsLastUnit,
          tsLastCompleteOption: FractionTsLastCompleteOptionEnum.Complete
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
        let tsLastUnit = getFractionTsUnits(tFilter.units);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`${tFilter.n} ${tFilter.units}s\``
              : `f\`not ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsInLast
              : FractionTypeEnum.TsIsNotInLast,
          tsLastValue: tsLastValue,
          tsLastUnit: tsLastUnit,
          tsLastCompleteOption:
            FractionTsLastCompleteOptionEnum.CompleteWithCurrent
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
        let tsNextUnit = getFractionTsUnits(tFilter.units);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`next ${tFilter.n} ${tFilter.units}s\``
              : `f\`not next ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsInNext
              : FractionTypeEnum.TsIsNotInNext,
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

          let timeSpecUnit: FractionTsUnitEnum =
            timeSpec === TimeSpecEnum.Years
              ? FractionTsUnitEnum.Years
              : timeSpec === TimeSpecEnum.Quarters
                ? FractionTsUnitEnum.Quarters
                : timeSpec === TimeSpecEnum.Months
                  ? FractionTsUnitEnum.Months
                  : timeSpec === TimeSpecEnum.Weeks
                    ? FractionTsUnitEnum.Weeks
                    : timeSpec === TimeSpecEnum.Days
                      ? FractionTsUnitEnum.Days
                      : timeSpec === TimeSpecEnum.Hours
                        ? FractionTsUnitEnum.Hours
                        : timeSpec === TimeSpecEnum.Minutes
                          ? FractionTsUnitEnum.Minutes
                          : undefined;

          let timeSpecCurrentUnitStartTs = getCurrentUnitStartTs({
            unit: timeSpecUnit,
            timezone: timezone,
            weekStart: weekStart
          });

          let timeSpecOneUnitDuration = getUnitDuration({
            value: 1,
            unit: timeSpecUnit
          });

          rangeStart = isUndefined(timeSpecOneUnitDuration)
            ? timestampsResult.currentTs
            : getUnixTime(
                add(
                  fromUnixTime(timeSpecCurrentUnitStartTs),
                  timeSpecOneUnitDuration
                )
              );

          let rStart = isUndefined(currentUnitStartTs)
            ? timestampsResult.currentTs
            : getUnixTime(
                add(fromUnixTime(currentUnitStartTs), oneUnitDuration)
              );

          let duration = getUnitDuration({
            value: tsNextValue,
            unit: tsNextUnit
          });

          rangeEnd = getUnixTime(add(fromUnixTime(rStart), duration));
        }
      } else if ((temporalFilter as Before).operator === 'before') {
        // temporal before (before)
        let tFilter = temporalFilter as Before;
        let before = tFilter.before;

        let { year, quarter, month, day, hour, minute } = parseTsLiteral({
          input: (before as TemporalLiteral).literal,
          units: (before as TemporalLiteral).units
        });

        let m = getMalloyMomentStr(tFilter.before);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`before ${m.momentStr}\``
              : `f\`starting ${m.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsBefore
              : FractionTypeEnum.TsIsStarting,
          tsMomentType: m.momentType,
          tsMoment: before,
          tsMomentAgoFromNowQuantity: isDefined(
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
            before.moment === 'literal' && isUndefined(before.units)
              ? before.literal
              : undefined,
          tsDateYear: isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: isDefined(quarter) ? Number(quarter) : undefined,
          tsDateMonth: isDefined(month) ? Number(month) : undefined,
          tsDateDay: isDefined(day) ? Number(day) : undefined,
          tsDateHour: isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: isDefined(minute) ? Number(minute) : undefined
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            timeSpec: timeSpec,
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

          if (fraction.type === FractionTypeEnum.TsIsBefore) {
            rangeEnd = start.momentRangeStart;
          } else if (fraction.type === FractionTypeEnum.TsIsStarting) {
            rangeStart =
              start.timeSpecMomentRangeStart < start.momentRangeStart
                ? isUndefined(start.timeSpecOneUnitDuration)
                  ? start.timeSpecMomentRangeStart
                  : getUnixTime(
                      add(
                        fromUnixTime(start.timeSpecMomentRangeStart),
                        start.timeSpecOneUnitDuration
                      )
                    )
                : start.timeSpecMomentRangeStart;
          }
        }
      } else if ((temporalFilter as After).operator === 'after') {
        // temporal after (after)
        let tFilter = temporalFilter as After;
        let after = tFilter.after;

        let { year, quarter, month, day, hour, minute } = parseTsLiteral({
          input: (after as TemporalLiteral).literal,
          units: (after as TemporalLiteral).units
        });

        let m = getMalloyMomentStr(tFilter.after);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`after ${m.momentStr}\``
              : `f\`through ${m.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsAfter
              : FractionTypeEnum.TsIsThrough,
          tsMomentType: m.momentType,
          tsMoment: after,
          tsMomentAgoFromNowQuantity: isDefined(
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
            after.moment === 'literal' && isUndefined(after.units)
              ? after.literal
              : undefined,
          tsDateYear: isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: isDefined(quarter) ? Number(quarter) : undefined,
          tsDateMonth: isDefined(month) ? Number(month) : undefined,
          tsDateDay: isDefined(day) ? Number(day) : undefined,
          tsDateHour: isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: isDefined(minute) ? Number(minute) : undefined
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            timeSpec: timeSpec,
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

          if (fraction.type === FractionTypeEnum.TsIsAfter) {
            rangeStart = isUndefined(start.timeSpecOneUnitDuration)
              ? start.timeSpecMomentRangeStart
              : getUnixTime(
                  add(
                    fromUnixTime(start.timeSpecMomentRangeStart),
                    start.timeSpecOneUnitDuration
                  )
                );
          } else if (fraction.type === FractionTypeEnum.TsIsThrough) {
            rangeEnd = isUndefined(start.momentOneUnitDuration) // now, literal with no units
              ? start.momentRangeStart
              : getUnixTime(
                  add(
                    fromUnixTime(start.momentRangeStart),
                    start.momentOneUnitDuration
                  )
                );
          }
        }
      } else if ((temporalFilter as To).operator === 'to') {
        // temporal to (between)
        let tFilter = temporalFilter as To;
        let from = tFilter.fromMoment;
        let to = tFilter.toMoment;

        let { year, quarter, month, day, hour, minute } = parseTsLiteral({
          input: (from as TemporalLiteral).literal,
          units: (from as TemporalLiteral).units
        });

        let {
          year: toYear,
          quarter: toQuarter,
          month: toMonth,
          day: toDay,
          hour: toHour,
          minute: toMinute
        } = parseTsLiteral({
          input: (to as TemporalLiteral).literal,
          units: (to as TemporalLiteral).units
        });

        let mFrom = getMalloyMomentStr(tFilter.fromMoment);
        let mTo = getMalloyMomentStr(tFilter.toMoment);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`${mFrom.momentStr} to ${mTo.momentStr}\``
              : `f\`not ${mFrom.momentStr} to ${mTo.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsBetween
              : FractionTypeEnum.TsIsNotBetween,
          tsFromMomentType: mFrom.momentType,
          tsToMomentType: mTo.momentType,
          tsFromMoment: from,
          tsFromMomentAgoFromNowQuantity: isDefined(
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
            from.moment === 'literal' && isUndefined(from.units)
              ? from.literal
              : undefined,
          tsToMoment: to,
          tsToMomentAgoFromNowQuantity: isDefined(
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
            to.moment === 'literal' && isUndefined(to.units)
              ? to.literal
              : undefined,
          tsLastValue: undefined,
          tsLastUnit: undefined,
          tsLastCompleteOption: undefined,
          tsDateYear: isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: isDefined(quarter) ? Number(quarter) : undefined,
          tsDateMonth: isDefined(month) ? Number(month) : undefined,
          tsDateDay: isDefined(day) ? Number(day) : undefined,
          tsDateHour: isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: isDefined(minute) ? Number(minute) : undefined,
          tsDateToYear: isDefined(toYear) ? Number(toYear) : undefined,
          tsDateToQuarter: isDefined(toQuarter) ? Number(toQuarter) : undefined,
          tsDateToMonth: isDefined(toMonth) ? Number(toMonth) : undefined,
          tsDateToDay: isDefined(toDay) ? Number(toDay) : undefined,
          tsDateToHour: isDefined(toHour) ? Number(toHour) : undefined,
          tsDateToMinute: isDefined(toMinute) ? Number(toMinute) : undefined
        };

        if (isGetTimeRange === true) {
          let fromStart = getStart({
            timeSpec: timeSpec,
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
            timeSpec: timeSpec,
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

          rangeStart = fromStart.momentRangeStart;
          rangeEnd = toStart.momentRangeStart;
        }
      } else if ((temporalFilter as InMoment).operator === 'in') {
        // temporal in (on)
        let tFilter = temporalFilter as InMoment;
        let tfIn = tFilter.in;

        let { year, quarter, month, day, hour, minute } = parseTsLiteral({
          input: (tfIn as TemporalLiteral).literal,
          units: (tfIn as TemporalLiteral).units
        });

        let m = getMalloyMomentStr(tfIn);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`${m.momentStr}\``
              : `f\`not ${m.momentStr}\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            (tfIn as TemporalLiteral).units === 'year'
              ? fractionOperator === FractionOperatorEnum.Or
                ? FractionTypeEnum.TsIsOnYear
                : FractionTypeEnum.TsIsNotOnYear
              : (tfIn as TemporalLiteral).units === 'quarter'
                ? fractionOperator === FractionOperatorEnum.Or
                  ? FractionTypeEnum.TsIsOnQuarter
                  : FractionTypeEnum.TsIsNotOnQuarter
                : (tfIn as TemporalLiteral).units === 'month'
                  ? fractionOperator === FractionOperatorEnum.Or
                    ? FractionTypeEnum.TsIsOnMonth
                    : FractionTypeEnum.TsIsNotOnMonth
                  : (tfIn as TemporalLiteral).units === 'week'
                    ? fractionOperator === FractionOperatorEnum.Or
                      ? FractionTypeEnum.TsIsOnWeek
                      : FractionTypeEnum.TsIsNotOnWeek
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
                      ? fractionOperator === FractionOperatorEnum.Or
                        ? FractionTypeEnum.TsIsOnDay
                        : FractionTypeEnum.TsIsNotOnDay
                      : (tfIn as TemporalLiteral).units === 'hour'
                        ? fractionOperator === FractionOperatorEnum.Or
                          ? FractionTypeEnum.TsIsOnHour
                          : FractionTypeEnum.TsIsNotOnHour
                        : (tfIn as TemporalLiteral).units === 'minute'
                          ? fractionOperator === FractionOperatorEnum.Or
                            ? FractionTypeEnum.TsIsOnMinute
                            : FractionTypeEnum.TsIsNotOnMinute
                          : tfIn.moment === 'literal' ||
                              (tfIn as NowMoment).moment === 'now'
                            ? fractionOperator === FractionOperatorEnum.Or
                              ? FractionTypeEnum.TsIsOnTimestamp
                              : FractionTypeEnum.TsIsNotOnTimestamp
                            : undefined,
          tsMomentType: m.momentType,
          tsMoment: tfIn,
          tsMomentAgoFromNowQuantity: isDefined(
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
            tfIn.moment === 'literal' && isUndefined(tfIn.units)
              ? tfIn.literal
              : undefined,
          tsDateYear: isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: isDefined(quarter) ? Number(quarter) : undefined,
          tsDateMonth: isDefined(month) ? Number(month) : undefined,
          tsDateDay: isDefined(day) ? Number(day) : undefined,
          tsDateHour: isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: isDefined(minute) ? Number(minute) : undefined
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            timeSpec: timeSpec,
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

          rangeStart = start.momentRangeStart;

          rangeEnd = isUndefined(start.momentOneUnitDuration) // now, literal with no units // maybe no such case
            ? start.momentRangeStart
            : getUnixTime(
                add(fromUnixTime(rangeStart), start.momentOneUnitDuration)
              );
        }
      } else if ((temporalFilter as For).operator === 'for') {
        // temporal for (begin ... for ...) [starts ... for ...]
        let tFilter = temporalFilter as For;
        let begin = tFilter.begin;

        let { year, quarter, month, day, hour, minute } = parseTsLiteral({
          input: (begin as TemporalLiteral).literal,
          units: (begin as TemporalLiteral).units
        });

        let m = getMalloyMomentStr(tFilter.begin);

        fraction = {
          brick:
            fractionOperator === FractionOperatorEnum.Or
              ? `f\`${m.momentStr} for ${tFilter.n} ${tFilter.units}s\``
              : `f\`not ${m.momentStr} for ${tFilter.n} ${tFilter.units}s\``,
          parentBrick: parentBrick,
          operator: fractionOperator,
          type:
            fractionOperator === FractionOperatorEnum.Or
              ? FractionTypeEnum.TsIsBeginFor
              : FractionTypeEnum.TsIsNotBeginFor,
          tsMomentType: m.momentType,
          tsMoment: begin,
          tsMomentAgoFromNowQuantity: isDefined(
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
            begin.moment === 'literal' && isUndefined(begin.units)
              ? begin.literal
              : undefined,
          tsDateYear: isDefined(year) ? Number(year) : undefined,
          tsDateQuarter: isDefined(quarter) ? Number(quarter) : undefined,
          tsDateMonth: isDefined(month) ? Number(month) : undefined,
          tsDateDay: isDefined(day) ? Number(day) : undefined,
          tsDateHour: isDefined(hour) ? Number(hour) : undefined,
          tsDateMinute: isDefined(minute) ? Number(minute) : undefined,
          tsForUnit: getFractionTsUnits(tFilter.units),
          tsForValue: Number(tFilter.n)
        };

        if (isGetTimeRange === true) {
          let start = getStart({
            timeSpec: timeSpec,
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

          rangeStart = start.timeSpecMomentRangeStart;

          rangeEnd = getUnixTime(
            add(fromUnixTime(start.momentRangeStart), forDuration)
          );
        }
      }

      if (isDefined(fraction)) {
        fractions.push(fraction);
      }
    });

  if (isDefined(rangeEnd) && isDefined(rangeStart) && rangeEnd < rangeStart) {
    rangeEnd = rangeStart;
  }

  return { fractions: fractions, rangeStart: rangeStart, rangeEnd: rangeEnd };
}

function getStart(item: {
  currentTs: number;
  timeSpec: TimeSpecEnum;
  moment: Moment;
  weekStart: ProjectWeekStartEnum;
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
    timeSpec,
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

  let momentUnit =
    (moment as TemporalLiteral).units === 'year'
      ? FractionTsUnitEnum.Years
      : (moment as TemporalLiteral).units === 'quarter'
        ? FractionTsUnitEnum.Quarters
        : (moment as TemporalLiteral).units === 'month'
          ? FractionTsUnitEnum.Months
          : (moment as TemporalLiteral).units === 'week'
            ? FractionTsUnitEnum.Weeks
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
              ? FractionTsUnitEnum.Days
              : (moment as TemporalLiteral).units === 'hour'
                ? FractionTsUnitEnum.Hours
                : (moment as TemporalLiteral).units === 'minute'
                  ? FractionTsUnitEnum.Minutes
                  : undefined;

  let timeSpecUnit: FractionTsUnitEnum =
    timeSpec === TimeSpecEnum.Years
      ? FractionTsUnitEnum.Years
      : timeSpec === TimeSpecEnum.Quarters
        ? FractionTsUnitEnum.Quarters
        : timeSpec === TimeSpecEnum.Months
          ? FractionTsUnitEnum.Months
          : timeSpec === TimeSpecEnum.Weeks
            ? FractionTsUnitEnum.Weeks
            : timeSpec === TimeSpecEnum.Days
              ? FractionTsUnitEnum.Days
              : timeSpec === TimeSpecEnum.Hours
                ? FractionTsUnitEnum.Hours
                : timeSpec === TimeSpecEnum.Minutes
                  ? FractionTsUnitEnum.Minutes
                  : undefined;

  let momentCurrentUnitStartTs = getCurrentUnitStartTs({
    unit: momentUnit,
    timezone: timezone,
    weekStart: weekStart
  });

  let momentOneUnitDuration = getUnitDuration({
    value: 1,
    unit: momentUnit
  });

  let timeSpecOneUnitDuration = getUnitDuration({
    value: 1,
    unit: timeSpecUnit
  });

  let momentAgoFromNowDuration = getUnitDuration({
    value: agoFromNowQuantity,
    unit: momentUnit
  });

  let momentRangeStart =
    moment.moment === 'now'
      ? currentTs
      : moment.moment === 'literal' && isUndefined(moment.units)
        ? getUnixTime(new Date(moment.literal))
        : momentUnit === FractionTsUnitEnum.Days &&
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
              currentUnitStartTs: momentCurrentUnitStartTs
            })
          : momentUnit === FractionTsUnitEnum.Days && moment.moment === 'today'
            ? momentCurrentUnitStartTs
            : momentUnit === FractionTsUnitEnum.Days &&
                moment.moment === 'yesterday'
              ? getUnixTime(
                  sub(
                    fromUnixTime(momentCurrentUnitStartTs),
                    momentOneUnitDuration
                  )
                )
              : momentUnit === FractionTsUnitEnum.Days &&
                  moment.moment === 'tomorrow'
                ? getUnixTime(
                    add(
                      fromUnixTime(momentCurrentUnitStartTs),
                      momentOneUnitDuration
                    )
                  )
                : moment.moment === 'this'
                  ? momentCurrentUnitStartTs
                  : moment.moment === 'last'
                    ? getUnixTime(
                        sub(
                          fromUnixTime(momentCurrentUnitStartTs),
                          momentOneUnitDuration
                        )
                      )
                    : moment.moment === 'next'
                      ? getUnixTime(
                          add(
                            fromUnixTime(momentCurrentUnitStartTs),
                            momentOneUnitDuration
                          )
                        )
                      : moment.moment === 'ago'
                        ? getUnixTime(
                            sub(
                              fromUnixTime(momentCurrentUnitStartTs),
                              momentAgoFromNowDuration
                            )
                          )
                        : moment.moment === 'from_now'
                          ? getUnixTime(
                              add(
                                fromUnixTime(momentCurrentUnitStartTs),
                                momentAgoFromNowDuration
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

  let timeSpecMomentRangeStart = getTimeSpecUnitMomentStartTs({
    timeSpec: timeSpec,
    weekStart: weekStart,
    unixTime: momentRangeStart
  });

  return {
    timeSpecOneUnitDuration: timeSpecOneUnitDuration,
    timeSpecMomentRangeStart: timeSpecMomentRangeStart,
    momentRangeStart: momentRangeStart,
    momentUnit: momentUnit,
    momentOneUnitDuration: momentOneUnitDuration
  };
}
