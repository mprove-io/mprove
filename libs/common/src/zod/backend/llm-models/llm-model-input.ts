import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type LlmModelInput = {
  modelId: string;
  name?: string;
  isManual?: boolean;
  contextLimit?: number;
  inputLimit?: number;
  outputLimit?: number;
  isExplorer: boolean;
  isBuilder: boolean;
};

export let zLlmModelInput = z
  .strictObject({
    modelId: z.string().trim().min(1),
    name: z.string().trim().nullish(),
    isManual: z.boolean().nullish(),
    contextLimit: z.number().int().positive().nullish(),
    inputLimit: z.number().int().positive().nullish(),
    outputLimit: z.number().int().positive().nullish(),
    isExplorer: z.boolean(),
    isBuilder: z.boolean()
  })
  .meta({ id: 'LlmModelInput' });

assertTypesEqual<LlmModelInput, z.infer<typeof zLlmModelInput>>({
  value: true
});
