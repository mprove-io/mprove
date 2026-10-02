import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ExtraSchema,
  zExtraSchema
} from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema';
import {
  type MproveConfig,
  zMproveConfig
} from '#common/types/backend/parts/mprove-config';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';
import {
  type ModelMetric,
  zModelMetric
} from '#common/types/blockml/parts/model-metric';
import { type Preset, zPreset } from '#common/types/blockml/parts/preset';
import { type Space, zSpace } from '#common/types/blockml/parts/space';

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

export let zStructLt = z
  .object({
    errors: z.array(zBmlError),
    modelFilePaths: z.array(z.string()).default([]),
    metrics: z.array(zModelMetric),
    presets: z.array(zPreset),
    spaces: z.array(zSpace),
    extraSchemas: z.array(zExtraSchema),
    mproveConfig: zMproveConfig,
    mproveExplorer: z.string().nullish()
  })
  .meta({ id: 'StructLt' });

assertTypesEqual<StructLt, z.infer<typeof zStructLt>>({ value: true });
