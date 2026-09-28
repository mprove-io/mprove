import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetServerUsersRequest = {
  operation: 'getServerUsers';
  traceId: string;
  idempotencyKey: string;
  input: {
    pageNum: number;
    perPage: number;
  };
};

export let zToBackendGetServerUsersRequest = z
  .strictObject({
    operation: z.literal('getServerUsers'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        pageNum: z.number(),
        perPage: z.number()
      })
      .meta({ id: 'ToBackendGetServerUsersInput' })
  })
  .meta({ id: 'ToBackendGetServerUsersRequest' });

assertTypesEqual<
  ToBackendGetServerUsersRequest,
  z.infer<typeof zToBackendGetServerUsersRequest>
>({ value: true });
