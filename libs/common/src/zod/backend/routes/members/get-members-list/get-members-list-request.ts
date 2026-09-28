import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetMembersListRequest = {
  operation: 'getMembersList';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetMembersListRequest = z
  .strictObject({
    operation: z.literal('getMembersList'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendGetMembersListInput' })
  })
  .meta({ id: 'ToBackendGetMembersListRequest' });

assertTypesEqual<
  ToBackendGetMembersListRequest,
  z.infer<typeof zToBackendGetMembersListRequest>
>({ value: true });
