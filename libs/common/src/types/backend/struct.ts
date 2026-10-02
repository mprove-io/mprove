import { z } from 'zod';
import { zMproveConfig } from '#common/types/backend/mprove-config';
import { zBmlError } from '#common/types/blockml/bml-error';
import { zModelMetric } from '#common/types/blockml/model-metric';
import { zPreset } from '#common/types/blockml/preset';
import { zSpace } from '#common/types/blockml/space';

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

export type Struct = z.infer<typeof zStruct>;
