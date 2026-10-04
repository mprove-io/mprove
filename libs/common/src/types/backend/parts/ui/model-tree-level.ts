import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const modelTreeLevelValues = [
  'Flat',
  'FlatTime',
  'Nested',
  'NestedFlatTime'
] as const;

export type ModelTreeLevel = (typeof modelTreeLevelValues)[number];

export let zModelTreeLevel = z.enum(modelTreeLevelValues);

assertTypesEqual<ModelTreeLevel, z.infer<typeof zModelTreeLevel>>({
  value: true
});
