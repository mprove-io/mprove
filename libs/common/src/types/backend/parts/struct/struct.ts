import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveConfig,
  zMproveConfig
} from '#common/types/backend/parts/mprove-config';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/diagnostics/bml-error';
import {
  type ModelMetric,
  zModelMetric
} from '#common/types/blockml/parts/model/model-metric';
import { type Preset, zPreset } from '#common/types/blockml/parts/preset';
import { type Space, zSpace } from '#common/types/blockml/parts/space';

export type Struct = {
  projectId: string;
  structId: string;
  errors: BmlError[];
  modelFilePaths: string[];
  metrics: ModelMetric[];
  presets: Preset[];
  spaces: Space[];
  mproveConfig: MproveConfig;
  mproveExplorer?: string;
  mproveVersion: string;
  serverTs: number;
};

export let zStruct = z
  .object({
    projectId: z.string(),
    structId: z.string(),
    errors: z.array(zBmlError),
    modelFilePaths: z.array(z.string()),
    metrics: z.array(zModelMetric),
    presets: z.array(zPreset),
    spaces: z.array(zSpace),
    mproveConfig: zMproveConfig,
    mproveExplorer: z.string().nullish(),
    mproveVersion: z.string(),
    serverTs: z.number().int()
  })
  .meta({ id: 'Struct' });

assertTypesEqual<Struct, z.infer<typeof zStruct>>({ value: true });
