import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const modelTypeValues = ['Store', 'Malloy'] as const;

export type ModelType = (typeof modelTypeValues)[number];

export let zModelType = z.enum(modelTypeValues);

assertTypesEqual<ModelType, z.infer<typeof zModelType>>({
  value: true
});
