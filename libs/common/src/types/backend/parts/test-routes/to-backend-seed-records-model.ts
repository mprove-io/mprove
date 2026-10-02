import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelInput,
  zLlmModelInput
} from '#common/types/backend/parts/llm-models/llm-model-input';
import type { Extend } from '#common/types/extend';

export type ToBackendSeedRecordsModel = Extend<
  LlmModelInput,
  {
    providerModelInfo?: Record<string, unknown>;
    isExplorerRecommended?: boolean;
    isBuilderRecommended?: boolean;
  }
>;

export let zToBackendSeedRecordsModel = zLlmModelInput
  .extend({
    providerModelInfo: z.record(z.string(), z.unknown()).nullish(),
    isExplorerRecommended: z.boolean().nullish(),
    isBuilderRecommended: z.boolean().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsModel' });

assertTypesEqual<
  ToBackendSeedRecordsModel,
  z.infer<typeof zToBackendSeedRecordsModel>
>({ value: true });
