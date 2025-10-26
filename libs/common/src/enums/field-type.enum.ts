export enum FieldTypeEnum {
  CountDistinct = 'count_distinct',

  Sum = 'sum',
  SumByKey = 'sum_by_key',

  Average = 'average',
  AverageByKey = 'average_by_key',

  MedianByKey = 'median_by_key',
  PercentileByKey = 'percentile_by_key',
  Min = 'min',
  Max = 'max',
  List = 'list',
  Custom = 'custom',
  YesnoIsTrue = 'yesno_is_true'
}
