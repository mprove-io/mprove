import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEnvInput = {
  projectId: string;
  envId: string;
};

export type ToBackendCreateEnvRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateEnvInput;
};

export let zToBackendCreateEnvInput = z
  .object({
    projectId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateEnvInput' });

export let zToBackendCreateEnvRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateEnvInput
  })
  .meta({ id: 'ToBackendCreateEnvRequest' });

assertTypesEqual<
  ToBackendCreateEnvInput,
  z.infer<typeof zToBackendCreateEnvInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEnvRequest,
  z.infer<typeof zToBackendCreateEnvRequest>
>({ value: true });
