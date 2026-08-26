import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type LlmModelVariant,
  zLlmModelVariant
} from '#common/zod/backend/llm-models/llm-model-variant';

export type ToBackendEditLlmModelRequestPayload = {
  projectId: string;
  providerId: string;
  modelId: string;
  name?: string;
  contextLimit?: number;
  inputLimit?: number;
  outputLimit?: number;
  variants: LlmModelVariant[];
  isExplorer: boolean;
  isBuilder: boolean;
};

export let zToBackendEditLlmModelRequestPayload = z
  .strictObject({
    projectId: z.string(),
    providerId: z.string(),
    modelId: z.string().trim().min(1),
    name: z.string().trim().nullish(),
    contextLimit: z.number().int().positive().nullish(),
    inputLimit: z.number().int().positive().nullish(),
    outputLimit: z.number().int().positive().nullish(),
    variants: z.array(zLlmModelVariant),
    isExplorer: z.boolean(),
    isBuilder: z.boolean()
  })
  .meta({ id: 'ToBackendEditLlmModelRequestPayload' });

assertTypesEqual<
  ToBackendEditLlmModelRequestPayload,
  z.infer<typeof zToBackendEditLlmModelRequestPayload>
>({ value: true });
