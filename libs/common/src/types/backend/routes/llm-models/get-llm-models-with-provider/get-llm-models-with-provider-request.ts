import { z } from 'zod';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetLlmModelsWithProviderRequest = {
  operation: 'getLlmModelsWithProvider';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    sessionTypes: (SessionTypeEnum.Explorer | SessionTypeEnum.Editor)[];
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
        sessionTypes: z.array(z.enum(SessionTypeEnum))
      })
      .meta({ id: 'ToBackendGetLlmModelsWithProviderInput' })
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderRequest' });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderRequest,
  z.infer<typeof zToBackendGetLlmModelsWithProviderRequest>
>({ value: true });
