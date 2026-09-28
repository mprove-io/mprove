import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetMembersRequest = {
  operation: 'getMembers';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    pageNum: number;
    perPage: number;
  };
};

export let zToBackendGetMembersRequest = z
  .strictObject({
    operation: z.literal('getMembers'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        pageNum: z.number(),
        perPage: z.number()
      })
      .meta({ id: 'ToBackendGetMembersInput' })
  })
  .meta({ id: 'ToBackendGetMembersRequest' });

assertTypesEqual<
  ToBackendGetMembersRequest,
  z.infer<typeof zToBackendGetMembersRequest>
>({ value: true });
