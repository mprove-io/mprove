import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateRoleRequest = {
  operation: 'createRole';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    roleId: string;
  };
};

export let zToBackendCreateRoleRequest = z
  .strictObject({
    operation: z.literal('createRole'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        roleId: z.string().regex(MyRegex.ROLE_ID(), {
          message:
            'roleId must start with a lowercase letter or underscore and contain only lowercase letters, digits and underscores'
        })
      })
      .meta({ id: 'ToBackendCreateRoleInput' })
  })
  .meta({ id: 'ToBackendCreateRoleRequest' });

assertTypesEqual<
  ToBackendCreateRoleRequest,
  z.infer<typeof zToBackendCreateRoleRequest>
>({ value: true });
