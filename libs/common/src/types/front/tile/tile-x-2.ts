import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { Extend } from '#common/types/extend';

export type TileX2 = Extend<
  TileX,
  {
    modelFields?: Record<string, ModelField[]>;
    mconfigListenSwap?: Record<string, string[]>;
  }
>;
