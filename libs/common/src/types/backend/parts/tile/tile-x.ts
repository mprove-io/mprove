import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigX,
  zMconfigX
} from '#common/types/backend/parts/mconfig/mconfig-x';
import { type Query, zQuery } from '#common/types/blockml/parts/query/query';
import { type Tile, zTile } from '#common/types/blockml/parts/tile/tile';
import type { Extend } from '#common/types/extend';

export type TileX = Extend<
  Tile,
  { mconfig?: MconfigX; query?: Query; hasAccessToModel: boolean }
>;

export let zTileX = zTile
  .extend({
    mconfig: zMconfigX.nullish(),
    query: zQuery.nullish(),
    hasAccessToModel: z.boolean()
  })
  .meta({ id: 'TileX' });

assertTypesEqual<TileX, z.infer<typeof zTileX>>({ value: true });
