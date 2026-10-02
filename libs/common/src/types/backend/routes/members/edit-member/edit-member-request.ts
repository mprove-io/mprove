import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditMemberRequest = {
  operation: 'editMember';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    memberId: string;
    isAdmin: boolean;
    isEditor: boolean;
    isExplorer: boolean;
    roles: string[];
  };
};

export let zToBackendEditMemberRequest = z
  .strictObject({
    operation: z.literal('editMember'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        memberId: z.string(),
        isAdmin: z.boolean(),
        isEditor: z.boolean(),
        isExplorer: z.boolean(),
        roles: z.array(z.string())
      })
      .meta({ id: 'ToBackendEditMemberInput' })
  })
  .meta({ id: 'ToBackendEditMemberRequest' });

assertTypesEqual<
  ToBackendEditMemberRequest,
  z.infer<typeof zToBackendEditMemberRequest>
>({ value: true });
