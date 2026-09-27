import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditEnvFallbacksInput = {
  projectId: string;
  envId: string;
  isFallbackToProdConnections: boolean;
  isFallbackToProdVariables: boolean;
  useProdCache: boolean;
};

export type ToBackendEditEnvFallbacksRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditEnvFallbacksInput;
};

export let zToBackendEditEnvFallbacksInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    isFallbackToProdConnections: z.boolean(),
    isFallbackToProdVariables: z.boolean(),
    useProdCache: z.boolean()
  })
  .meta({ id: 'ToBackendEditEnvFallbacksInput' });

export let zToBackendEditEnvFallbacksRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditEnvFallbacksInput
  })
  .meta({ id: 'ToBackendEditEnvFallbacksRequest' });

assertTypesEqual<
  ToBackendEditEnvFallbacksInput,
  z.infer<typeof zToBackendEditEnvFallbacksInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditEnvFallbacksRequest,
  z.infer<typeof zToBackendEditEnvFallbacksRequest>
>({ value: true });
