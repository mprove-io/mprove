export enum FractionTypeEnum {
  StoreFraction = 'StoreFraction',
  //
  StringIsAnyValue = 'StringIsAnyValue',

  StringIsEqualTo = 'StringIsEqualTo',
  StringStartsWith = 'StringStartsWith',
  StringEndsWith = 'StringEndsWith',
  StringContains = 'StringContains',
  StringIsLike = 'StringIsLike', // new
  StringIsEmpty = 'StringIsEmpty',
  StringIsNull = 'StringIsNull',

  StringIsNotEqualTo = 'StringIsNotEqualTo',
  StringDoesNotStartWith = 'StringDoesNotStartWith',
  StringDoesNotEndWith = 'StringDoesNotEndWith',
  StringDoesNotContain = 'StringDoesNotContain',
  StringIsNotLike = 'StringIsNotLike', // new
  StringIsNotEmpty = 'StringIsNotEmpty',
  StringIsNotNull = 'StringIsNotNull',

  NumberIsAnyValue = 'NumberIsAnyValue',

  NumberIsEqualTo = 'NumberIsEqualTo',
  NumberIsGreaterThan = 'NumberIsGreaterThan',
  NumberIsGreaterThanOrEqualTo = 'NumberIsGreaterThanOrEqualTo',
  NumberIsLessThan = 'NumberIsLessThan',
  NumberIsLessThanOrEqualTo = 'NumberIsLessThanOrEqualTo',
  NumberIsBetween = 'NumberIsBetween',
  NumberIsNull = 'NumberIsNull',

  NumberIsNotEqualTo = 'NumberIsNotEqualTo',
  NumberIsNotGreaterThan = 'NumberIsNotGreaterThan', // new // not supported (malloy issue)
  NumberIsNotGreaterThanOrEqualTo = 'NumberIsNotGreaterThanOrEqualTo', // new // not supported (malloy issue)
  NumberIsNotLessThan = 'NumberIsNotLessThan', // new // not supported (malloy issue)
  NumberIsNotLessThanOrEqualTo = 'NumberIsNotLessThanOrEqualTo', // new // not supported (malloy issue)
  NumberIsNotBetween = 'NumberIsNotBetween', // new // test combined with other NOTs
  NumberIsNotNull = 'NumberIsNotNull',

  BooleanIsAnyValue = 'BooleanIsAnyValue',

  BooleanIsTrue = 'BooleanIsTrue',
  BooleanIsFalse = 'BooleanIsFalse',
  BooleanIsFalseOrNull = 'BooleanIsFalseOrNull',
  BooleanIsNull = 'BooleanIsNull',

  BooleanIsNotTrue = 'BooleanIsNotTrue', // not supported (malloy issue)
  BooleanIsNotFalse = 'BooleanIsNotFalse', // not supported (malloy issue)
  BooleanIsNotFalseOrNull = 'BooleanIsNotFalseOrNull', // not supported (malloy issue)
  BooleanIsNotNull = 'BooleanIsNotNull',

  TsIsAnyValue = 'TsIsAnyValue',

  TsIsInLast = 'TsIsInLast',
  TsIsOnDay = 'TsIsOnDay',
  TsIsOnWeek = 'TsIsOnWeek', // new
  TsIsOnMonth = 'TsIsOnMonth',
  TsIsOnQuarter = 'TsIsOnQuarter', // new
  TsIsOnYear = 'TsIsOnYear',
  TsIsInNext = 'TsIsInNext', // new
  TsIsAfter = 'TsIsAfter',
  TsIsStarting = 'TsIsStarting', // new // TsIsNotBefore
  TsIsBeginFor = 'TsIsBeginFor', // new
  TsIsBetween = 'TsIsBetween',
  TsIsBefore = 'TsIsBefore',
  TsIsThrough = 'TsIsThrough', // new // TsIsNotAfter
  TsIsOnHour = 'TsIsOnHour',
  TsIsOnMinute = 'TsIsOnMinute',
  TsIsOnTimestamp = 'TsIsOnTimestamp', // new
  TsIsNull = 'TsIsNull',

  TsIsNotInLast = 'TsIsNotInLast', // new
  TsIsNotOnDay = 'TsIsNotOnDay', // new
  TsIsNotOnWeek = 'TsIsNotOnWeek', // new
  TsIsNotOnMonth = 'TsIsNotOnMonth', // new
  TsIsNotOnQuarter = 'TsIsNotOnQuarter', // new
  TsIsNotOnYear = 'TsIsNotOnYear', // new
  TsIsNotInNext = 'TsIsNotInNext', // new
  TsIsNotBeginFor = 'TsIsNotBeginFor', // new
  TsIsNotBetween = 'TsIsNotBetween', // new
  TsIsNotOnHour = 'TsIsNotOnHour', // new
  TsIsNotOnMinute = 'TsIsNotOnMinute', // new
  TsIsNotOnTimestamp = 'TsIsNotOnTimestamp', // new
  TsIsNotNull = 'TsIsNotNull',

  //

  DayOfWeekIsAnyValue = 'DayOfWeekIsAnyValue',
  DayOfWeekIs = 'DayOfWeekIs',
  DayOfWeekIsNull = 'DayOfWeekIsNull',
  DayOfWeekIsNot = 'DayOfWeekIsNot',
  DayOfWeekIsNotNull = 'DayOfWeekIsNotNull',

  DayOfWeekIndexIsAnyValue = 'DayOfWeekIndexIsAnyValue',
  DayOfWeekIndexIsEqualTo = 'DayOfWeekIndexIsEqualTo',
  DayOfWeekIndexIsNull = 'DayOfWeekIndexIsNull',
  DayOfWeekIndexIsNotEqualTo = 'DayOfWeekIndexIsNotEqualTo',
  DayOfWeekIndexIsNotNull = 'DayOfWeekIndexIsNotNull',

  MonthNameIsAnyValue = 'MonthNameIsAnyValue',
  MonthNameIs = 'MonthNameIs',
  MonthNameIsNull = 'MonthNameIsNull',
  MonthNameIsNot = 'MonthNameIsNot',
  MonthNameIsNotNull = 'MonthNameIsNotNull',

  QuarterOfYearIsAnyValue = 'QuarterOfYearIsAnyValue',
  QuarterOfYearIs = 'QuarterOfYearIs',
  QuarterOfYearIsNull = 'QuarterOfYearIsNull',
  QuarterOfYearIsNot = 'QuarterOfYearIsNot',
  QuarterOfYearIsNotNull = 'QuarterOfYearIsNotNull',

  //

  TsIsBeforeRelative = 'TsIsBeforeRelative',
  TsIsAfterRelative = 'TsIsAfterRelative',

  YesnoIsAnyValue = 'YesnoIsAnyValue',
  YesnoIs = 'YesnoIs'
}
