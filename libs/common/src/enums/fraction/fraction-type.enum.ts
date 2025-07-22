export enum FractionTypeEnum {
  StoreFraction = 'StoreFraction',
  //
  StringIsAnyValue = 'StringIsAnyValue',

  StringIsLike = 'StringIsLike',
  StringIsEqualTo = 'StringIsEqualTo',
  StringContains = 'StringContains',
  StringStartsWith = 'StringStartsWith',
  StringEndsWith = 'StringEndsWith',
  StringIsNull = 'StringIsNull',
  StringIsBlank = 'StringIsBlank',

  StringIsNotLike = 'StringIsNotLike',
  StringIsNotEqualTo = 'StringIsNotEqualTo',
  StringDoesNotContain = 'StringDoesNotContain',
  StringDoesNotStartWith = 'StringDoesNotStartWith',
  StringDoesNotEndWith = 'StringDoesNotEndWith',
  StringIsNotNull = 'StringIsNotNull',
  StringIsNotBlank = 'StringIsNotBlank',

  NumberIsAnyValue = 'NumberIsAnyValue',

  NumberIsEqualTo = 'NumberIsEqualTo',
  NumberIsGreaterThan = 'NumberIsGreaterThan',
  NumberIsGreaterThanOrEqualTo = 'NumberIsGreaterThanOrEqualTo',
  NumberIsLessThan = 'NumberIsLessThan',
  NumberIsLessThanOrEqualTo = 'NumberIsLessThanOrEqualTo',
  NumberIsBetween = 'NumberIsBetween',
  NumberIsNull = 'NumberIsNull',

  NumberIsNotEqualTo = 'NumberIsNotEqualTo',
  NumberIsNotGreaterThan = 'NumberIsNotGreaterThan', // new
  NumberIsNotGreaterThanOrEqualTo = 'NumberIsNotGreaterThanOrEqualTo', // new
  NumberIsNotLessThan = 'NumberIsNotLessThan', // new
  NumberIsNotLessThanOrEqualTo = 'NumberIsNotLessThanOrEqualTo', // new
  NumberIsNotBetween = 'NumberIsNotBetween',
  NumberIsNotNull = 'NumberIsNotNull',

  BooleanIsAnyValue = 'BooleanIsAnyValue',

  BooleanIsTrue = 'BooleanIsTrue',
  BooleanIsFalse = 'BooleanIsFalse',
  BooleanIsFalseOrNull = 'BooleanIsFalseOrNull',
  BooleanIsNull = 'BooleanIsNull',

  BooleanIsNotTrue = 'BooleanIsNotTrue',
  BooleanIsNotFalse = 'BooleanIsNotFalse',
  BooleanIsNotFalseOrNull = 'BooleanIsNotFalseOrNull',
  BooleanIsNotNull = 'BooleanIsNotNull',

  TsIsAnyValue = 'TsIsAnyValue',

  TsIsInLast = 'TsIsInLast',
  TsIsInNext = 'TsIsInNext', // new
  TsIsBeforeDate = 'TsIsBeforeDate',
  TsIsAfterDate = 'TsIsAfterDate',
  TsIsNull = 'TsIsNull',

  TsIsNotInLast = 'TsIsNotInLast', // new
  TsIsNotInNext = 'TsIsNotInNext', // new
  TsIsNotBeforeDate = 'TsIsNotBeforeDate', // new
  TsIsNotAfterDate = 'TsIsNotAfterDate', // new
  TsIsNotNull = 'TsIsNotNull',

  TsIsOnMinute = 'TsIsOnMinute',
  TsIsOnHour = 'TsIsOnHour',
  TsIsOnDay = 'TsIsOnDay',
  TsIsOnMonth = 'TsIsOnMonth',
  TsIsOnYear = 'TsIsOnYear',
  TsIsInRange = 'TsIsInRange',

  TsIsBeforeRelative = 'TsIsBeforeRelative',
  TsIsAfterRelative = 'TsIsAfterRelative',

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

  YesnoIsAnyValue = 'YesnoIsAnyValue',
  YesnoIs = 'YesnoIs'
}
