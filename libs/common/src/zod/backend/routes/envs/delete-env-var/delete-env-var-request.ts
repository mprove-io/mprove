import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteEnvVarInput = {
  projectId: string;
  envId: string;
  evId: string;
};

export type ToBackendDeleteEnvVarRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteEnvVarInput;
};

export let zToBackendDeleteEnvVarInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evId: z.string()
  })
  .meta({ id: 'ToBackendDeleteEnvVarInput' });

export let zToBackendDeleteEnvVarRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteEnvVarInput
  })
  .meta({ id: 'ToBackendDeleteEnvVarRequest' });

assertTypesEqual<
  ToBackendDeleteEnvVarInput,
  z.infer<typeof zToBackendDeleteEnvVarInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteEnvVarRequest,
  z.infer<typeof zToBackendDeleteEnvVarRequest>
>({ value: true });
