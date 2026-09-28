import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEnvUserRequest = {
  operation: 'createEnvUser';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    envUserId: string;
  };
};

export let zToBackendCreateEnvUserRequest = z
  .strictObject({
    operation: z.literal('createEnvUser'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        envUserId: z.string()
      })
      .meta({ id: 'ToBackendCreateEnvUserInput' })
  })
  .meta({ id: 'ToBackendCreateEnvUserRequest' });

assertTypesEqual<
  ToBackendCreateEnvUserRequest,
  z.infer<typeof zToBackendCreateEnvUserRequest>
>({ value: true });
