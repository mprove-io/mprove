import { z } from 'zod';
import { zTileX } from '#common/zod/backend/tile-x';
import { zModelField } from '#common/zod/blockml/model-field';

export let zTileX2 = zTileX
  .extend({
    modelFields: z.record(z.string(), z.array(zModelField)).nullish(),
    mconfigListenSwap: z.record(z.string(), z.array(z.string())).nullish()
  })
  .meta({ id: 'TileX2' });

export type TileX2 = z.infer<typeof zTileX2>;
