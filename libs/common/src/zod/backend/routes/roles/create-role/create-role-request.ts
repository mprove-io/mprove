import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateRoleInput = {
  projectId: string;
  roleId: string;
};

export type ToBackendCreateRoleRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateRoleInput;
};

export let zToBackendCreateRoleInput = z
  .object({
    projectId: z.string(),
    roleId: z.string().regex(MyRegex.ROLE_ID(), {
      message:
        'roleId must start with a lowercase letter or underscore and contain only lowercase letters, digits and underscores'
    })
  })
  .meta({ id: 'ToBackendCreateRoleInput' });

export let zToBackendCreateRoleRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateRoleInput
  })
  .meta({ id: 'ToBackendCreateRoleRequest' });

assertTypesEqual<
  ToBackendCreateRoleInput,
  z.infer<typeof zToBackendCreateRoleInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateRoleRequest,
  z.infer<typeof zToBackendCreateRoleRequest>
>({ value: true });
