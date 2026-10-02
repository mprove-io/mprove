import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteRoleGivenRequest = {
  operation: 'deleteRoleGiven';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    roleId: string;
    givenId: string;
  };
};

export let zToBackendDeleteRoleGivenRequest = z
  .strictObject({
    operation: z.literal('deleteRoleGiven'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        roleId: z.string(),
        givenId: z.string()
      })
      .meta({ id: 'ToBackendDeleteRoleGivenInput' })
  })
  .meta({ id: 'ToBackendDeleteRoleGivenRequest' });

assertTypesEqual<
  ToBackendDeleteRoleGivenRequest,
  z.infer<typeof zToBackendDeleteRoleGivenRequest>
>({ value: true });
