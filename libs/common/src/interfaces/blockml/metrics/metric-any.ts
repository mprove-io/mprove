import { ApiMetric } from './api-metric';
import { FormulaMetric } from './formula-metric';
import { ModelMetric } from './model-metric';
import { SqlMetric } from './sql-metric';

export interface MetricAny
  extends ApiMetric,
    FormulaMetric,
    ModelMetric,
    SqlMetric {}
