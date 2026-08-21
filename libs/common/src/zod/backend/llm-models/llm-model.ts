import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type LlmModelPart,
  zLlmModelPart
} from '#common/zod/backend/llm-models/llm-model-part';

export type LlmModel = Extend<
  LlmModelPart,
  {
    catalogName?: string;
    name?: string;
    isManual?: boolean;
    isExplorer: boolean;
    isBuilder: boolean;
    refreshedTs: number;
  }
>;

export let zLlmModel = zLlmModelPart
  .extend({
    catalogName: z.string().trim().nullish(),
    name: z.string().trim().nullish(),
    isManual: z.boolean().nullish(),
    isExplorer: z.boolean(),
    isBuilder: z.boolean(),
    refreshedTs: z.number().int()
  })
  .meta({ id: 'LlmModel' });

assertTypesEqual<LlmModel, z.infer<typeof zLlmModel>>({ value: true });
