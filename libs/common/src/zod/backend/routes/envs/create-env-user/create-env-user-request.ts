import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEnvUserInput = {
  projectId: string;
  envId: string;
  envUserId: string;
};

export type ToBackendCreateEnvUserRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateEnvUserInput;
};

export let zToBackendCreateEnvUserInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    envUserId: z.string()
  })
  .meta({ id: 'ToBackendCreateEnvUserInput' });

export let zToBackendCreateEnvUserRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateEnvUserInput
  })
  .meta({ id: 'ToBackendCreateEnvUserRequest' });

assertTypesEqual<
  ToBackendCreateEnvUserInput,
  z.infer<typeof zToBackendCreateEnvUserInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEnvUserRequest,
  z.infer<typeof zToBackendCreateEnvUserRequest>
>({ value: true });
