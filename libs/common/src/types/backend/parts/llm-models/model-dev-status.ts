import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const modelDevStatusValues = ['alpha', 'beta', 'deprecated'] as const;

export type ModelDevStatus = (typeof modelDevStatusValues)[number];

export let zModelDevStatus = z.enum(modelDevStatusValues);

assertTypesEqual<ModelDevStatus, z.infer<typeof zModelDevStatus>>({
  value: true
});
