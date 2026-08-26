import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type LlmModelInput,
  zLlmModelInput
} from '#common/zod/backend/llm-models/llm-model-input';

export type ToBackendSeedRecordsModel = Extend<
  LlmModelInput,
  {
    isExplorerRecommended?: boolean;
    isBuilderRecommended?: boolean;
  }
>;

export let zToBackendSeedRecordsModel = zLlmModelInput
  .extend({
    isExplorerRecommended: z.boolean().nullish(),
    isBuilderRecommended: z.boolean().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsModel' });

assertTypesEqual<
  ToBackendSeedRecordsModel,
  z.infer<typeof zToBackendSeedRecordsModel>
>({ value: true });
