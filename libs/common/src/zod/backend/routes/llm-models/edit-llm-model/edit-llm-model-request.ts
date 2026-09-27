import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelVariant,
  zLlmModelVariant
} from '#common/zod/backend/llm-models/llm-model-variant';

export type ToBackendEditLlmModelInput = {
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

export type ToBackendEditLlmModelRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditLlmModelInput;
};

export let zToBackendEditLlmModelInput = z
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
  .meta({ id: 'ToBackendEditLlmModelInput' });

export let zToBackendEditLlmModelRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditLlmModelInput
  })
  .meta({ id: 'ToBackendEditLlmModelRequest' });

assertTypesEqual<
  ToBackendEditLlmModelInput,
  z.infer<typeof zToBackendEditLlmModelInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditLlmModelRequest,
  z.infer<typeof zToBackendEditLlmModelRequest>
>({ value: true });
