import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditEnvFallbacksRequest = {
  operation: 'editEnvFallbacks';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    isFallbackToProdConnections: boolean;
    isFallbackToProdVariables: boolean;
    useProdCache: boolean;
  };
};

export let zToBackendEditEnvFallbacksRequest = z
  .strictObject({
    operation: z.literal('editEnvFallbacks'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        isFallbackToProdConnections: z.boolean(),
        isFallbackToProdVariables: z.boolean(),
        useProdCache: z.boolean()
      })
      .meta({ id: 'ToBackendEditEnvFallbacksInput' })
  })
  .meta({ id: 'ToBackendEditEnvFallbacksRequest' });

assertTypesEqual<
  ToBackendEditEnvFallbacksRequest,
  z.infer<typeof zToBackendEditEnvFallbacksRequest>
>({ value: true });
