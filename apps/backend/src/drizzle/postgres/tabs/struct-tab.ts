import { MproveConfig } from '~common/interfaces/backend/mprove-config';
import { BmlError } from '~common/interfaces/blockml/bml-error';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Preset } from '~common/interfaces/blockml/preset';
import { StructEnt } from '../schema/structs';

export interface StructTab
  extends Omit<StructEnt, 'st' | 'lt'>,
    StructSt,
    StructLt {}

export class StructSt {
  emptyData?: number;
}

export class StructLt {
  errors: BmlError[];
  metrics: ModelMetric[];
  presets: Preset[];
  mproveConfig: MproveConfig;
}
