import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteRoleRequest = {
  operation: 'deleteRole';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    roleId: string;
  };
};

export let zToBackendDeleteRoleRequest = z
  .strictObject({
    operation: z.literal('deleteRole'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        roleId: z.string()
      })
      .meta({ id: 'ToBackendDeleteRoleInput' })
  })
  .meta({ id: 'ToBackendDeleteRoleRequest' });

assertTypesEqual<
  ToBackendDeleteRoleRequest,
  z.infer<typeof zToBackendDeleteRoleRequest>
>({ value: true });
