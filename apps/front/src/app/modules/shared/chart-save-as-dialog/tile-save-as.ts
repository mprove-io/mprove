import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const tileSaveAsValues = ['NEW_TILE', 'REPLACE_EXISTING_TILE'] as const;

export type TileSaveAs = (typeof tileSaveAsValues)[number];

export let zTileSaveAs = z.enum(tileSaveAsValues);

assertTypesEqual<TileSaveAs, z.infer<typeof zTileSaveAs>>({
  value: true
});
