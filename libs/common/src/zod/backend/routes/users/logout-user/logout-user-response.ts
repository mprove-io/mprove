import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendLogoutUserOutput,
  zToBackendLogoutUserOutput
} from '#common/zod/backend/routes/users/logout-user/logout-user-output';
import {
  type ToBackendLogoutUserError,
  zToBackendLogoutUserError
} from './logout-user-error';

export type ToBackendLogoutUserResponse = ToBackendResponseBase<
  'logoutUser',
  ToBackendLogoutUserOutput,
  ToBackendLogoutUserError
>;

export let zToBackendLogoutUserResponse = makeToBackendResponseSchema({
  operation: 'logoutUser',
  output: zToBackendLogoutUserOutput,
  error: zToBackendLogoutUserError
}).meta({ id: 'ToBackendLogoutUserResponse' });

assertTypesEqual<
  ToBackendLogoutUserResponse,
  z.infer<typeof zToBackendLogoutUserResponse>
>({ value: true });
