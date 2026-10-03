import type { ExtraSchema } from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema';
import type { MproveConfig } from '#common/types/backend/parts/mprove-config';
import type { BmlError } from '#common/types/blockml/parts/bml-error';
import type { ModelMetric } from '#common/types/blockml/parts/model-metric';
import type { Preset } from '#common/types/blockml/parts/preset';
import type { Space } from '#common/types/blockml/parts/space';

export type StructLt = {
  errors: BmlError[];
  modelFilePaths: string[];
  metrics: ModelMetric[];
  presets: Preset[];
  spaces: Space[];
  extraSchemas: ExtraSchema[];
  mproveConfig: MproveConfig;
  mproveExplorer?: string;
};
