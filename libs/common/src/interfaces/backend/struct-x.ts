import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ModelMetricX } from './model-metric-x';
import { Struct } from './struct';

export class StructX extends Struct {
  @ValidateNested()
  @Type(() => ModelMetricX)
  metrics: ModelMetricX[];
}
