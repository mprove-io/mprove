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
  NumberIsNotBetween = 'NumberIsNotBetween', // not supported (malloy issue)
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
  TsIsInNext = 'TsIsInNext', // new
  TsIsBeforeDate = 'TsIsBeforeDate',
  TsIsAfterDate = 'TsIsAfterDate',
  TsIsInRange = 'TsIsInRange',
  TsIsBeginFor = 'TsIsBeginFor', // new
  TsIsOnYear = 'TsIsOnYear',
  TsIsOnQuarter = 'TsIsOnQuarter', // new
  TsIsOnMonth = 'TsIsOnMonth',
  TsIsOnWeek = 'TsIsOnWeek', // new
  TsIsOnDay = 'TsIsOnDay',
  TsIsOnHour = 'TsIsOnHour',
  TsIsOnMinute = 'TsIsOnMinute',
  TsIsOnTimestamp = 'TsIsOnTimestamp', // new
  TsIsNull = 'TsIsNull',

  TsIsNotInLast = 'TsIsNotInLast', // new
  TsIsNotInNext = 'TsIsNotInNext', // new
  TsIsStarting = 'TsIsStarting', // new // TsIsNotBeforeDate
  TsIsThrough = 'TsIsThrough', // new // TsIsNotAfterDate
  TsIsNotInRange = 'TsIsNotInRange', // new
  TsIsNotBeginFor = 'TsIsNotBeginFor', // new
  TsIsNotOnYear = 'TsIsNotOnYear', // new
  TsIsNotOnQuarter = 'TsIsNotOnQuarter', // new
  TsIsNotOnMonth = 'TsIsNotOnMonth', // new
  TsIsNotOnWeek = 'TsIsNotOnWeek', // new
  TsIsNotOnDay = 'TsIsNotOnDay', // new
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
