import { IsBoolean } from 'class-validator';
import { ModelMetric } from '../blockml/model-metric';

export class ModelMetricX extends ModelMetric {
  @IsBoolean()
  hasAccessToModel: boolean;
}
