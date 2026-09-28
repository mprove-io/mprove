import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetMemberGivensRequest = {
  operation: 'getMemberGivens';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    memberId: string;
  };
};

export let zToBackendGetMemberGivensRequest = z
  .strictObject({
    operation: z.literal('getMemberGivens'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        memberId: z.string()
      })
      .meta({ id: 'ToBackendGetMemberGivensInput' })
  })
  .meta({ id: 'ToBackendGetMemberGivensRequest' });

assertTypesEqual<
  ToBackendGetMemberGivensRequest,
  z.infer<typeof zToBackendGetMemberGivensRequest>
>({ value: true });
