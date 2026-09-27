import { z } from 'zod';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetLlmModelsWithProviderInput = {
  projectId: string;
  sessionTypes: (SessionTypeEnum.Explorer | SessionTypeEnum.Editor)[];
};

export type ToBackendGetLlmModelsWithProviderRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetLlmModelsWithProviderInput;
};

export let zToBackendGetLlmModelsWithProviderInput = z
  .object({
    projectId: z.string(),
    sessionTypes: z.array(z.enum(SessionTypeEnum))
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderInput' });

export let zToBackendGetLlmModelsWithProviderRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetLlmModelsWithProviderInput
  })
  .meta({ id: 'ToBackendGetLlmModelsWithProviderRequest' });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderInput,
  z.infer<typeof zToBackendGetLlmModelsWithProviderInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderRequest,
  z.infer<typeof zToBackendGetLlmModelsWithProviderRequest>
>({ value: true });
