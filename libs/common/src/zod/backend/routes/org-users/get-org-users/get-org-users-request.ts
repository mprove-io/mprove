import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetOrgUsersRequest = {
  operation: 'getOrgUsers';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
    pageNum: number;
    perPage: number;
  };
};

export let zToBackendGetOrgUsersRequest = z
  .strictObject({
    operation: z.literal('getOrgUsers'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string(),
        pageNum: z.number(),
        perPage: z.number()
      })
      .meta({ id: 'ToBackendGetOrgUsersInput' })
  })
  .meta({ id: 'ToBackendGetOrgUsersRequest' });

assertTypesEqual<
  ToBackendGetOrgUsersRequest,
  z.infer<typeof zToBackendGetOrgUsersRequest>
>({ value: true });
