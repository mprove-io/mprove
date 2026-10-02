import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteEnvRequest = {
  operation: 'deleteEnv';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
  };
};

export let zToBackendDeleteEnvRequest = z
  .strictObject({
    operation: z.literal('deleteEnv'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendDeleteEnvInput' })
  })
  .meta({ id: 'ToBackendDeleteEnvRequest' });

assertTypesEqual<
  ToBackendDeleteEnvRequest,
  z.infer<typeof zToBackendDeleteEnvRequest>
>({ value: true });
