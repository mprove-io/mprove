import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteEnvVarRequest = {
  operation: 'deleteEnvVar';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    evId: string;
  };
};

export let zToBackendDeleteEnvVarRequest = z
  .strictObject({
    operation: z.literal('deleteEnvVar'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        evId: z.string()
      })
      .meta({ id: 'ToBackendDeleteEnvVarInput' })
  })
  .meta({ id: 'ToBackendDeleteEnvVarRequest' });

assertTypesEqual<
  ToBackendDeleteEnvVarRequest,
  z.infer<typeof zToBackendDeleteEnvVarRequest>
>({ value: true });
