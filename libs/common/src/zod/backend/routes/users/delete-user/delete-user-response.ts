import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteUserOutput,
  zToBackendDeleteUserOutput
} from '#common/zod/backend/routes/users/delete-user/delete-user-output';
import {
  type ToBackendDeleteUserError,
  zToBackendDeleteUserError
} from './delete-user-error';

export type ToBackendDeleteUserResponse = ToBackendResponseBase<
  'deleteUser',
  ToBackendDeleteUserOutput,
  ToBackendDeleteUserError
>;

export let zToBackendDeleteUserResponse = makeToBackendResponseSchema({
  operation: 'deleteUser',
  output: zToBackendDeleteUserOutput,
  error: zToBackendDeleteUserError
}).meta({ id: 'ToBackendDeleteUserResponse' });

assertTypesEqual<
  ToBackendDeleteUserResponse,
  z.infer<typeof zToBackendDeleteUserResponse>
>({ value: true });
