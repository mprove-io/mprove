import { z } from 'zod';
import { zMconfigX } from '#common/types/backend/mconfig-x';
import { zQuery } from '#common/types/blockml/query';
import { zTile } from '#common/types/blockml/tile';

export let zTileX = zTile
  .extend({
    mconfig: zMconfigX.nullish(),
    query: zQuery.nullish(),
    hasAccessToModel: z.boolean()
  })
  .meta({ id: 'TileX' });

export type TileX = z.infer<typeof zTileX>;
