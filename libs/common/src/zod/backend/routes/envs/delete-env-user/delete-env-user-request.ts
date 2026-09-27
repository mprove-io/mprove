import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteEnvUserInput = {
  projectId: string;
  envId: string;
  envUserId: string;
};

export type ToBackendDeleteEnvUserRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteEnvUserInput;
};

export let zToBackendDeleteEnvUserInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    envUserId: z.string()
  })
  .meta({ id: 'ToBackendDeleteEnvUserInput' });

export let zToBackendDeleteEnvUserRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteEnvUserInput
  })
  .meta({ id: 'ToBackendDeleteEnvUserRequest' });

assertTypesEqual<
  ToBackendDeleteEnvUserInput,
  z.infer<typeof zToBackendDeleteEnvUserInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteEnvUserRequest,
  z.infer<typeof zToBackendDeleteEnvUserRequest>
>({ value: true });
