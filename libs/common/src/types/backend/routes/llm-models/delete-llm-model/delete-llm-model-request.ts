import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteLlmModelRequest = {
  operation: 'deleteLlmModel';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    providerId: string;
    modelId: string;
  };
};

export let zToBackendDeleteLlmModelRequest = z
  .strictObject({
    operation: z.literal('deleteLlmModel'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        providerId: z.string(),
        modelId: z.string().trim().min(1)
      })
      .meta({ id: 'ToBackendDeleteLlmModelInput' })
  })
  .meta({ id: 'ToBackendDeleteLlmModelRequest' });

assertTypesEqual<
  ToBackendDeleteLlmModelRequest,
  z.infer<typeof zToBackendDeleteLlmModelRequest>
>({ value: true });
