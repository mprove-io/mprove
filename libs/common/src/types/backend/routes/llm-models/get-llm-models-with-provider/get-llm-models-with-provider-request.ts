import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { SessionType } from '#common/types/backend/parts/session/session-type';
import { zSessionType } from '#common/types/backend/parts/session/session-type';

export type ToBackendGetLlmModelsWithProviderRequest = {
  operation: 'getLlmModelsWithProvider';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    sessionTypes: SessionType[];
  };
};

export let zToBackendGetLlmModelsWithProviderRequest = z
  .strictObject({
    operation: z.literal('getLlmModelsWithProvider'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        sessionTypes: z.array(zSessionType)
      })
      .meta({ id: 'ToBackendGetLlmModelsWithProviderInput' })
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderRequest' });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderRequest,
  z.infer<typeof zToBackendGetLlmModelsWithProviderRequest>
>({ value: true });
