import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteRoleOutput,
  zToBackendDeleteRoleOutput
} from '#common/zod/backend/routes/roles/delete-role/delete-role-output';
import {
  type ToBackendDeleteRoleError,
  zToBackendDeleteRoleError
} from './delete-role-error';

export type ToBackendDeleteRoleResponse = ToBackendResponseBase<
  'deleteRole',
  ToBackendDeleteRoleOutput,
  ToBackendDeleteRoleError
>;

export let zToBackendDeleteRoleResponse = makeToBackendResponseSchema({
  operation: 'deleteRole',
  output: zToBackendDeleteRoleOutput,
  error: zToBackendDeleteRoleError
}).meta({ id: 'ToBackendDeleteRoleResponse' });

assertTypesEqual<
  ToBackendDeleteRoleResponse,
  z.infer<typeof zToBackendDeleteRoleResponse>
>({ value: true });
