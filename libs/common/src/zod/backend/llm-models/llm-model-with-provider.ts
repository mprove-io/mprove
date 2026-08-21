import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type LlmModel,
  zLlmModel
} from '#common/zod/backend/llm-models/llm-model';

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
