import { z } from 'zod';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zQuery } from '#common/zod/blockml/query';
import { zTile } from '#common/zod/blockml/tile';

export let zTileX = zTile
  .extend({
    mconfig: zMconfigX.nullish(),
    query: zQuery.nullish(),
    hasAccessToModel: z.boolean()
  })
  .meta({ id: 'TileX' });

export type TileX = z.infer<typeof zTileX>;
