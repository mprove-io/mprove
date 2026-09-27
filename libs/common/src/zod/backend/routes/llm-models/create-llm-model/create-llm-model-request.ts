import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type LlmModelVariant,
  zLlmModelVariant
} from '#common/zod/backend/llm-models/llm-model-variant';

export type ToBackendCreateLlmModelInput = {
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

export type ToBackendCreateLlmModelRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateLlmModelInput;
};

export let zToBackendCreateLlmModelInput = z
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
  .meta({ id: 'ToBackendCreateLlmModelInput' });

export let zToBackendCreateLlmModelRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateLlmModelInput
  })
  .meta({ id: 'ToBackendCreateLlmModelRequest' });

assertTypesEqual<
  ToBackendCreateLlmModelInput,
  z.infer<typeof zToBackendCreateLlmModelInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateLlmModelRequest,
  z.infer<typeof zToBackendCreateLlmModelRequest>
>({ value: true });
