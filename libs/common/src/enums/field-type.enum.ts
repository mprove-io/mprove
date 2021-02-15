export enum FieldTypeEnum {
  CountDistinct = 'count_distinct', // measure
  SumByKey = 'sum_by_key', // measure
  AverageByKey = 'average_by_key', // measure
  MedianByKey = 'median_by_key', // measure
  PercentileByKey = 'percentile_by_key', // measure
  Min = 'min', // measure
  Max = 'max', // measure
  List = 'list', // measure
  Custom = 'custom', // measure, dimension
  YesnoIsTrue = 'yesno_is_true' // dimension
}
