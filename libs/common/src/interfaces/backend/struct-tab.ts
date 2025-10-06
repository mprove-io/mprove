import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { BmlError } from '../blockml/bml-error';
import { ModelMetric } from '../blockml/model-metric';
import { Preset } from '../blockml/preset';
import { MproveConfig } from './mprove-config';

export class StructTab {
  @ValidateNested()
  @Type(() => BmlError)
  errors: BmlError[];

  @ValidateNested()
  @Type(() => ModelMetric)
  metrics: ModelMetric[];

  @ValidateNested()
  @Type(() => Preset)
  presets: Preset[];

  @ValidateNested()
  @Type(() => MproveConfig)
  mproveConfig: MproveConfig;
}
