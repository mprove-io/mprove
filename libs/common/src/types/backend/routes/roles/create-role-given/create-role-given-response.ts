import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateRoleGivenOutput,
  zToBackendCreateRoleGivenOutput
} from '#common/types/backend/routes/roles/create-role-given/create-role-given-output';
import {
  type ToBackendCreateRoleGivenError,
  zToBackendCreateRoleGivenError
} from './create-role-given-error';

export type ToBackendCreateRoleGivenResponse = ToBackendResponseBase<
  'createRoleGiven',
  ToBackendCreateRoleGivenOutput,
  ToBackendCreateRoleGivenError
>;

export let zToBackendCreateRoleGivenResponse = makeToBackendResponseSchema({
  operation: 'createRoleGiven',
  output: zToBackendCreateRoleGivenOutput,
  error: zToBackendCreateRoleGivenError
}).meta({ id: 'ToBackendCreateRoleGivenResponse' });

assertTypesEqual<
  ToBackendCreateRoleGivenResponse,
  z.infer<typeof zToBackendCreateRoleGivenResponse>
>({ value: true });
