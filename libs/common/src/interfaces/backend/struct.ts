import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { BmlError } from '../blockml/bml-error';
import { ModelMetric } from '../blockml/model-metric';
import { Preset } from '../blockml/preset';
import { MproveConfig } from './mprove-config';

export class Struct {
  @IsString()
  projectId: string;

  @IsString()
  structId: string;

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

  @IsString()
  mproveVersion: string;

  @IsInt()
  serverTs: number;
}
