import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetLlmModelPartsRequest = {
  operation: 'getLlmModelParts';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    providerId: string;
  };
};

export let zToBackendGetLlmModelPartsRequest = z
  .strictObject({
    operation: z.literal('getLlmModelParts'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .strictObject({
        projectId: z.string(),
        providerId: z.string().trim().min(1)
      })
      .meta({ id: 'ToBackendGetLlmModelPartsInput' })
  })
  .meta({ id: 'ToBackendGetLlmModelPartsRequest' });

assertTypesEqual<
  ToBackendGetLlmModelPartsRequest,
  z.infer<typeof zToBackendGetLlmModelPartsRequest>
>({ value: true });
