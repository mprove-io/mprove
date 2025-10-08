import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MproveConfig } from '~common/interfaces/backend/mprove-config';
import { BmlError } from '~common/interfaces/blockml/bml-error';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Preset } from '~common/interfaces/blockml/preset';
import { StructEnt } from '../schema/structs';

export interface StructTab extends Omit<StructEnt, 'st' | 'lt'> {
  st: StructSt;
  lt: StructLt;
}

export class StructSt {
  emptyData?: number;
}

export class StructLt {
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
