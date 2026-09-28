import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEnvVarRequest = {
  operation: 'createEnvVar';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    evId: string;
    val: string;
  };
};

export let zToBackendCreateEnvVarRequest = z
  .strictObject({
    operation: z.literal('createEnvVar'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        evId: z.string(),
        val: z.string()
      })
      .meta({ id: 'ToBackendCreateEnvVarInput' })
  })
  .meta({ id: 'ToBackendCreateEnvVarRequest' });

assertTypesEqual<
  ToBackendCreateEnvVarRequest,
  z.infer<typeof zToBackendCreateEnvVarRequest>
>({ value: true });
