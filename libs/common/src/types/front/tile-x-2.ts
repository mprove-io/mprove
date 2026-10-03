import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TileX, zTileX } from '#common/types/backend/parts/tile-x';
import {
  type ModelField,
  zModelField
} from '#common/types/blockml/parts/model-field';
import type { Extend } from '#common/types/extend';

export type TileX2 = Extend<
  TileX,
  {
    modelFields?: Record<string, ModelField[]>;
    mconfigListenSwap?: Record<string, string[]>;
  }
>;

export let zTileX2 = zTileX
  .extend({
    modelFields: z.record(z.string(), z.array(zModelField)).nullish(),
    mconfigListenSwap: z.record(z.string(), z.array(z.string())).nullish()
  })
  .meta({ id: 'TileX2' });

assertTypesEqual<TileX2, z.infer<typeof zTileX2>>({ value: true });
