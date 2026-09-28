import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetRolesOutput,
  zToBackendGetRolesOutput
} from '#common/zod/backend/routes/roles/get-roles/get-roles-output';
import {
  type ToBackendGetRolesError,
  zToBackendGetRolesError
} from './get-roles-error';

export type ToBackendGetRolesResponse = ToBackendResponseBase<
  'getRoles',
  ToBackendGetRolesOutput,
  ToBackendGetRolesError
>;

export let zToBackendGetRolesResponse = makeToBackendResponseSchema({
  operation: 'getRoles',
  output: zToBackendGetRolesOutput,
  error: zToBackendGetRolesError
}).meta({ id: 'ToBackendGetRolesResponse' });

assertTypesEqual<
  ToBackendGetRolesResponse,
  z.infer<typeof zToBackendGetRolesResponse>
>({ value: true });
