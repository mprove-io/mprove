import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateMemberRequest = {
  operation: 'createMember';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    email: string;
  };
};

export let zToBackendCreateMemberRequest = z
  .strictObject({
    operation: z.literal('createMember'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        email: z.string()
      })
      .meta({ id: 'ToBackendCreateMemberInput' })
  })
  .meta({ id: 'ToBackendCreateMemberRequest' });

assertTypesEqual<
  ToBackendCreateMemberRequest,
  z.infer<typeof zToBackendCreateMemberRequest>
>({ value: true });
