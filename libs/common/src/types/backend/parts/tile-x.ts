import { z } from 'zod';
import { zMconfigX } from '#common/types/backend/parts/mconfig-x';
import { zQuery } from '#common/types/blockml/parts/query';
import { zTile } from '#common/types/blockml/parts/tile';

export let zTileX = zTile
  .extend({
    mconfig: zMconfigX.nullish(),
    query: zQuery.nullish(),
    hasAccessToModel: z.boolean()
  })
  .meta({ id: 'TileX' });

export type TileX = z.infer<typeof zTileX>;
