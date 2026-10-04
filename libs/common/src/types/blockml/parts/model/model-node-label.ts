import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const modelNodeLabelValues = [
  'Filter-only fields',
  'Dimensions',
  'Measures',
  'Calculations'
] as const;

export type ModelNodeLabel = (typeof modelNodeLabelValues)[number];

export let zModelNodeLabel = z.enum(modelNodeLabelValues);

assertTypesEqual<ModelNodeLabel, z.infer<typeof zModelNodeLabel>>({
  value: true
});
