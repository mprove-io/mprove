import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelVariant,
  zLlmModelVariant
} from '#common/types/backend/parts/llm-models/llm-model-variant';

export type ToBackendCreateLlmModelRequest = {
  operation: 'createLlmModel';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    providerId: string;
    modelId: string;
    name?: string;
    isManual: boolean;
    contextLimit?: number;
    inputLimit?: number;
    outputLimit?: number;
    variants: LlmModelVariant[];
    isExplorer: boolean;
    isBuilder: boolean;
  };
};

export let zToBackendCreateLlmModelRequest = z
  .strictObject({
    operation: z.literal('createLlmModel'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendCreateLlmModelInput' })
  })
  .meta({ id: 'ToBackendCreateLlmModelRequest' });

assertTypesEqual<
  ToBackendCreateLlmModelRequest,
  z.infer<typeof zToBackendCreateLlmModelRequest>
>({ value: true });
