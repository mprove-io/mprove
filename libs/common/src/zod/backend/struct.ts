import { z } from 'zod';
import { zMproveConfig } from '#common/zod/backend/mprove-config';
import { zBmlError } from '#common/zod/blockml/bml-error';
import { zModelMetric } from '#common/zod/blockml/model-metric';
import { zPreset } from '#common/zod/blockml/preset';

export let zStruct = z
  .object({
    projectId: z.string(),
    structId: z.string(),
    errors: z.array(zBmlError),
    metrics: z.array(zModelMetric),
    presets: z.array(zPreset),
    mproveConfig: zMproveConfig,
    mproveVersion: z.string(),
    serverTs: z.number().int()
  })
  .meta({ id: 'Struct' });

export type Struct = z.infer<typeof zStruct>;
