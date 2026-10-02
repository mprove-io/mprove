import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModel,
  zLlmModel
} from '#common/types/backend/parts/llm-models/llm-model';
import type { Extend } from '#common/types/extend';

export type LlmModelWithProvider = Extend<
  LlmModel,
  {
    providerId: string;
    providerName: string;
  }
>;

export let zLlmModelWithProvider = zLlmModel
  .extend({
    providerId: z.string(),
    providerName: z.string()
  })
  .meta({ id: 'LlmModelWithProvider' });

assertTypesEqual<LlmModelWithProvider, z.infer<typeof zLlmModelWithProvider>>({
  value: true
});
