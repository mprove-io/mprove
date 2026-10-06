import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const placeNameValues = [
  'Main',
  'Original',
  'Right',
  'QueryInfo',
  'DiffDialogOriginal',
  'DiffDialogModified'
] as const;

export type PlaceName = (typeof placeNameValues)[number];

export let zPlaceName = z.enum(placeNameValues);

assertTypesEqual<PlaceName, z.infer<typeof zPlaceName>>({
  value: true
});
