import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditRoleGivenRequest = {
  operation: 'editRoleGiven';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    roleId: string;
    givenId: string;
    values: string[];
  };
};

export let zToBackendEditRoleGivenRequest = z
  .strictObject({
    operation: z.literal('editRoleGiven'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        roleId: z.string(),
        givenId: z.string(),
        values: z.array(z.string())
      })
      .meta({ id: 'ToBackendEditRoleGivenInput' })
  })
  .meta({ id: 'ToBackendEditRoleGivenRequest' });

assertTypesEqual<
  ToBackendEditRoleGivenRequest,
  z.infer<typeof zToBackendEditRoleGivenRequest>
>({ value: true });
