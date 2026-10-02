import { z } from 'zod';

export let zTile = z
  .object({
    modelId: z.string(),
    modelLabel: z.string(),
    modelFilePath: z.string(),
    mconfigId: z.string(),
    queryId: z.string(),
    trackChangeId: z.string(),
    listen: z.record(z.string(), z.string()),
    deletedFilterFieldIds: z.array(z.string()).nullish(),
    title: z.string(),
    plateWidth: z.number(),
    plateHeight: z.number(),
    plateX: z.number(),
    plateY: z.number()
  })
  .meta({ id: 'Tile' });

export type Tile = z.infer<typeof zTile>;
