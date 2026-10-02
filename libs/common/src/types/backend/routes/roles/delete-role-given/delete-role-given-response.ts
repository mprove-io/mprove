import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteRoleGivenOutput,
  zToBackendDeleteRoleGivenOutput
} from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-output';
import {
  type ToBackendDeleteRoleGivenError,
  zToBackendDeleteRoleGivenError
} from './delete-role-given-error';

export type ToBackendDeleteRoleGivenResponse = ToBackendResponseBase<
  'deleteRoleGiven',
  ToBackendDeleteRoleGivenOutput,
  ToBackendDeleteRoleGivenError
>;

export let zToBackendDeleteRoleGivenResponse = makeToBackendResponseSchema({
  operation: 'deleteRoleGiven',
  output: zToBackendDeleteRoleGivenOutput,
  error: zToBackendDeleteRoleGivenError
}).meta({ id: 'ToBackendDeleteRoleGivenResponse' });

assertTypesEqual<
  ToBackendDeleteRoleGivenResponse,
  z.infer<typeof zToBackendDeleteRoleGivenResponse>
>({ value: true });
