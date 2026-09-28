import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditEnvVarRequest = {
  operation: 'editEnvVar';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    evId: string;
    val: string;
  };
};

export let zToBackendEditEnvVarRequest = z
  .strictObject({
    operation: z.literal('editEnvVar'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        evId: z.string(),
        val: z.string()
      })
      .meta({ id: 'ToBackendEditEnvVarInput' })
  })
  .meta({ id: 'ToBackendEditEnvVarRequest' });

assertTypesEqual<
  ToBackendEditEnvVarRequest,
  z.infer<typeof zToBackendEditEnvVarRequest>
>({ value: true });
