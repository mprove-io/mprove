import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendEditRoleGivenOutput,
  zToBackendEditRoleGivenOutput
} from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-output';
import {
  type ToBackendEditRoleGivenError,
  zToBackendEditRoleGivenError
} from './edit-role-given-error';

export type ToBackendEditRoleGivenResponse = ToBackendResponseBase<
  'editRoleGiven',
  ToBackendEditRoleGivenOutput,
  ToBackendEditRoleGivenError
>;

export let zToBackendEditRoleGivenResponse = makeToBackendResponseSchema({
  operation: 'editRoleGiven',
  output: zToBackendEditRoleGivenOutput,
  error: zToBackendEditRoleGivenError
}).meta({ id: 'ToBackendEditRoleGivenResponse' });

assertTypesEqual<
  ToBackendEditRoleGivenResponse,
  z.infer<typeof zToBackendEditRoleGivenResponse>
>({ value: true });
