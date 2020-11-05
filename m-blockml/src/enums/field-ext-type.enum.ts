export enum FieldExtTypeEnum {
  CountDistinct = 'CountDistinct', // measure
  SumByKey = 'SumByKey', // measure
  AverageByKey = 'AverageByKey', // measure
  MedianByKey = 'MedianByKey', // measure
  PercentileByKey = 'PercentileByKey', // measure
  Min = 'Min', // measure
  Max = 'Max', // measure
  List = 'List', // measure
  Custom = 'Custom', // measure, dimension
  YesnoIsTrue = 'YesnoIsTrue' // dimension
}
