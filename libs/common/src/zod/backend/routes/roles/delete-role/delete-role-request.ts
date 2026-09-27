import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteRoleInput = {
  projectId: string;
  roleId: string;
};

export type ToBackendDeleteRoleRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteRoleInput;
};

export let zToBackendDeleteRoleInput = z
  .object({
    projectId: z.string(),
    roleId: z.string()
  })
  .meta({ id: 'ToBackendDeleteRoleInput' });

export let zToBackendDeleteRoleRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteRoleInput
  })
  .meta({ id: 'ToBackendDeleteRoleRequest' });

assertTypesEqual<
  ToBackendDeleteRoleInput,
  z.infer<typeof zToBackendDeleteRoleInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteRoleRequest,
  z.infer<typeof zToBackendDeleteRoleRequest>
>({ value: true });
