import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const modelNodeIdSuffixValues = [
  'filters',
  'dimensions',
  'measures',
  'calculations'
] as const;

export type ModelNodeIdSuffix = (typeof modelNodeIdSuffixValues)[number];

export let zModelNodeIdSuffix = z.enum(modelNodeIdSuffixValues);

assertTypesEqual<ModelNodeIdSuffix, z.infer<typeof zModelNodeIdSuffix>>({
  value: true
});
