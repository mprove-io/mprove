import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetNavRequest = {
  operation: 'getNav';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId?: string;
    projectId?: string;
    getRepo: boolean;
  };
};

export let zToBackendGetNavRequest = z
  .strictObject({
    operation: z.literal('getNav'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string().nullish(),
        projectId: z.string().nullish(),
        getRepo: z.boolean()
      })
      .meta({ id: 'ToBackendGetNavInput' })
  })
  .meta({ id: 'ToBackendGetNavRequest' });

assertTypesEqual<
  ToBackendGetNavRequest,
  z.infer<typeof zToBackendGetNavRequest>
>({ value: true });
