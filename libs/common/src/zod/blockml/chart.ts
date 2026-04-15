import { z } from 'zod';
import { zTile } from '#common/zod/blockml/tile';

export let zChart = z
  .object({
    structId: z.string(),
    chartId: z.string(),
    draft: z.boolean(),
    creatorId: z.string(),
    title: z.string(),
    modelId: z.string(),
    modelLabel: z.string(),
    filePath: z.string(),
    tiles: z.array(zTile),
    serverTs: z.number().int()
  })
  .meta({ id: 'Chart' });

export type Chart = z.infer<typeof zChart>;
