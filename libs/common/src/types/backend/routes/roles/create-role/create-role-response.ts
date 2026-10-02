import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateRoleOutput,
  zToBackendCreateRoleOutput
} from '#common/types/backend/routes/roles/create-role/create-role-output';
import {
  type ToBackendCreateRoleError,
  zToBackendCreateRoleError
} from './create-role-error';

export type ToBackendCreateRoleResponse = ToBackendResponseBase<
  'createRole',
  ToBackendCreateRoleOutput,
  ToBackendCreateRoleError
>;

export let zToBackendCreateRoleResponse = makeToBackendResponseSchema({
  operation: 'createRole',
  output: zToBackendCreateRoleOutput,
  error: zToBackendCreateRoleError
}).meta({ id: 'ToBackendCreateRoleResponse' });

assertTypesEqual<
  ToBackendCreateRoleResponse,
  z.infer<typeof zToBackendCreateRoleResponse>
>({ value: true });
