import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetEnvsRequest = {
  operation: 'getEnvs';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetEnvsRequest = z
  .strictObject({
    operation: z.literal('getEnvs'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendGetEnvsInput' })
  })
  .meta({ id: 'ToBackendGetEnvsRequest' });

assertTypesEqual<
  ToBackendGetEnvsRequest,
  z.infer<typeof zToBackendGetEnvsRequest>
>({ value: true });
