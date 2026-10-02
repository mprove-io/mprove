import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteMemberRequest = {
  operation: 'deleteMember';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    memberId: string;
  };
};

export let zToBackendDeleteMemberRequest = z
  .strictObject({
    operation: z.literal('deleteMember'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        memberId: z.string()
      })
      .meta({ id: 'ToBackendDeleteMemberInput' })
  })
  .meta({ id: 'ToBackendDeleteMemberRequest' });

assertTypesEqual<
  ToBackendDeleteMemberRequest,
  z.infer<typeof zToBackendDeleteMemberRequest>
>({ value: true });
