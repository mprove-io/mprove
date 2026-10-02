import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetRolesRequest = {
  operation: 'getRoles';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetRolesRequest = z
  .strictObject({
    operation: z.literal('getRoles'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendGetRolesInput' })
  })
  .meta({ id: 'ToBackendGetRolesRequest' });

assertTypesEqual<
  ToBackendGetRolesRequest,
  z.infer<typeof zToBackendGetRolesRequest>
>({ value: true });
