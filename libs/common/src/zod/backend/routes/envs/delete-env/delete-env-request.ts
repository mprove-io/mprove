import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteEnvInput = {
  projectId: string;
  envId: string;
};

export type ToBackendDeleteEnvRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteEnvInput;
};

export let zToBackendDeleteEnvInput = z
  .object({
    projectId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendDeleteEnvInput' });

export let zToBackendDeleteEnvRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteEnvInput
  })
  .meta({ id: 'ToBackendDeleteEnvRequest' });

assertTypesEqual<
  ToBackendDeleteEnvInput,
  z.infer<typeof zToBackendDeleteEnvInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteEnvRequest,
  z.infer<typeof zToBackendDeleteEnvRequest>
>({ value: true });
