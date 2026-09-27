import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteLlmModelInput = {
  projectId: string;
  providerId: string;
  modelId: string;
};

export type ToBackendDeleteLlmModelRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteLlmModelInput;
};

export let zToBackendDeleteLlmModelInput = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    modelId: z.string().trim().min(1)
  })
  .meta({ id: 'ToBackendDeleteLlmModelInput' });

export let zToBackendDeleteLlmModelRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteLlmModelInput
  })
  .meta({ id: 'ToBackendDeleteLlmModelRequest' });

assertTypesEqual<
  ToBackendDeleteLlmModelInput,
  z.infer<typeof zToBackendDeleteLlmModelInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteLlmModelRequest,
  z.infer<typeof zToBackendDeleteLlmModelRequest>
>({ value: true });
