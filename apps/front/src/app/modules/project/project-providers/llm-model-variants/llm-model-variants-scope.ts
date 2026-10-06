import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const llmModelVariantsScopeValues = ['Explorer', 'Builder'] as const;

export type LlmModelVariantsScope =
  (typeof llmModelVariantsScopeValues)[number];

export let zLlmModelVariantsScope = z.enum(llmModelVariantsScopeValues);

assertTypesEqual<LlmModelVariantsScope, z.infer<typeof zLlmModelVariantsScope>>(
  {
    value: true
  }
);
