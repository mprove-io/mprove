import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fractionTypeValues = [
  'StoreFraction',
  //
  'StringIsAnyValue',

  'StringIsEqualTo',
  'StringStartsWith',
  'StringEndsWith',
  'StringContains',
  'StringIsLike', // new
  'StringIsEmpty',
  'StringIsNull',

  'StringIsNotEqualTo',
  'StringDoesNotStartWith',
  'StringDoesNotEndWith',
  'StringDoesNotContain',
  'StringIsNotLike', // new
  'StringIsNotEmpty',
  'StringIsNotNull',

  'NumberIsAnyValue',

  'NumberIsEqualTo',
  'NumberIsGreaterThan',
  'NumberIsGreaterThanOrEqualTo',
  'NumberIsLessThan',
  'NumberIsLessThanOrEqualTo',
  'NumberIsBetween',
  'NumberIsNull',

  'NumberIsNotEqualTo',
  'NumberIsNotGreaterThan', // new
  'NumberIsNotGreaterThanOrEqualTo', // new
  'NumberIsNotLessThan', // new
  'NumberIsNotLessThanOrEqualTo', // new
  'NumberIsNotBetween', // new
  'NumberIsNotNull',

  'BooleanIsAnyValue',

  'BooleanIsTrue',
  'BooleanIsFalse',
  'BooleanIsTruthy',
  'BooleanIsFalsy',
  'BooleanIsNull',

  'BooleanIsNotTrue',
  'BooleanIsNotFalse',
  'BooleanIsNotTruthy',
  'BooleanIsNotFalsy',
  'BooleanIsNotNull',

  'TsIsAnyValue',

  'TsIsInLast',
  'TsIsOnDay',
  'TsIsOnWeek', // new
  'TsIsOnMonth',
  'TsIsOnQuarter', // new
  'TsIsOnYear',
  'TsIsInNext', // new
  'TsIsAfter', // TsIsNotThrough
  'TsIsStarting', // new // TsIsNotBefore
  'TsIsBeginFor', // new
  'TsIsBetween',
  'TsIsBefore', // TsIsNotStarting
  'TsIsThrough', // new // TsIsNotAfter
  'TsIsOnHour',
  'TsIsOnMinute',
  'TsIsOnTimestamp', // new
  'TsIsNull',

  'TsIsNotInLast', // new
  'TsIsNotOnDay', // new
  'TsIsNotOnWeek', // new
  'TsIsNotOnMonth', // new
  'TsIsNotOnQuarter', // new
  'TsIsNotOnYear', // new
  'TsIsNotInNext', // new
  'TsIsNotBeginFor', // new
  'TsIsNotBetween', // new
  'TsIsNotOnHour', // new
  'TsIsNotOnMinute', // new
  'TsIsNotOnTimestamp', // new
  'TsIsNotNull',

  //

  'DayOfWeekIsAnyValue',
  'DayOfWeekIs',
  'DayOfWeekIsNull',
  'DayOfWeekIsNot',
  'DayOfWeekIsNotNull',

  'DayOfWeekIndexIsAnyValue',
  'DayOfWeekIndexIsEqualTo',
  'DayOfWeekIndexIsNull',
  'DayOfWeekIndexIsNotEqualTo',
  'DayOfWeekIndexIsNotNull',

  'MonthNameIsAnyValue',
  'MonthNameIs',
  'MonthNameIsNull',
  'MonthNameIsNot',
  'MonthNameIsNotNull',

  'QuarterOfYearIsAnyValue',
  'QuarterOfYearIs',
  'QuarterOfYearIsNull',
  'QuarterOfYearIsNot',
  'QuarterOfYearIsNotNull',

  //

  'TsIsBeforeRelative',
  'TsIsAfterRelative',

  'YesnoIsAnyValue',
  'YesnoIs'
] as const;

export type FractionType = (typeof fractionTypeValues)[number];

export let zFractionType = z.enum(fractionTypeValues);

assertTypesEqual<FractionType, z.infer<typeof zFractionType>>({
  value: true
});
