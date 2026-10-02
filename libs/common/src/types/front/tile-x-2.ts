import { z } from 'zod';
import { zTileX } from '#common/types/backend/parts/tile-x';
import { zModelField } from '#common/types/blockml/parts/model-field';

export let zTileX2 = zTileX
  .extend({
    modelFields: z.record(z.string(), z.array(zModelField)).nullish(),
    mconfigListenSwap: z.record(z.string(), z.array(z.string())).nullish()
  })
  .meta({ id: 'TileX2' });

export type TileX2 = z.infer<typeof zTileX2>;
