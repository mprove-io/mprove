import { FormulaMetric } from './formula-metric';
import { ModelMetric } from './model-metric';
import { SqlMetric } from './sql-metric';

export interface MetricAny
  // ApiMetric,
  extends FormulaMetric,
    ModelMetric,
    SqlMetric {}
