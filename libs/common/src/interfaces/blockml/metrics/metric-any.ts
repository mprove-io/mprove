import { ApiMetric } from './api-metric';
import { EntryMetric } from './entry-metric';
import { FormulaMetric } from './formula-metric';
import { ModelMetric } from './model-metric';
import { SqlMetric } from './sql-metric';

export interface MetricAny
  extends ApiMetric,
    EntryMetric,
    FormulaMetric,
    ModelMetric,
    SqlMetric {}
