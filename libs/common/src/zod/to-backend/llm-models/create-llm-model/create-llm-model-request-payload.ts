import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type LlmModelVariant,
  zLlmModelVariant
} from '#common/zod/backend/llm-models/llm-model-variant';

export type ToBackendCreateLlmModelRequestPayload = {
  projectId: string;
  providerId: string;
  modelId: string;
  name?: string;
  outputLimit?: number;
  variants: LlmModelVariant[];
  isExplorer: boolean;
  isBuilder: boolean;
  isManual: boolean;
  contextLimit?: number;
  inputLimit?: number;
};

export let zToBackendCreateLlmModelRequestPayload = z
  .strictObject({
    projectId: z.string(),
    providerId: z.string(),
    modelId: z.string().trim().min(1),
    name: z.string().trim().nullish(),
    isManual: z.boolean(),
    contextLimit: z.number().int().positive().nullish(),
    inputLimit: z.number().int().positive().nullish(),
    outputLimit: z.number().int().positive().nullish(),
    variants: z.array(zLlmModelVariant),
    isExplorer: z.boolean(),
    isBuilder: z.boolean()
  })
  .meta({ id: 'ToBackendCreateLlmModelRequestPayload' });

assertTypesEqual<
  ToBackendCreateLlmModelRequestPayload,
  z.infer<typeof zToBackendCreateLlmModelRequestPayload>
>({ value: true });
