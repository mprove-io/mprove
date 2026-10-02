import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteEnvUserRequest = {
  operation: 'deleteEnvUser';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    envUserId: string;
  };
};

export let zToBackendDeleteEnvUserRequest = z
  .strictObject({
    operation: z.literal('deleteEnvUser'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        envUserId: z.string()
      })
      .meta({ id: 'ToBackendDeleteEnvUserInput' })
  })
  .meta({ id: 'ToBackendDeleteEnvUserRequest' });

assertTypesEqual<
  ToBackendDeleteEnvUserRequest,
  z.infer<typeof zToBackendDeleteEnvUserRequest>
>({ value: true });
