import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendLoginUserOutput,
  zToBackendLoginUserOutput
} from '#common/types/backend/routes/users/login-user/login-user-output';
import {
  type ToBackendLoginUserError,
  zToBackendLoginUserError
} from './login-user-error';

export type ToBackendLoginUserResponse = ToBackendResponseBase<
  'loginUser',
  ToBackendLoginUserOutput,
  ToBackendLoginUserError
>;

export let zToBackendLoginUserResponse = makeToBackendResponseSchema({
  operation: 'loginUser',
  output: zToBackendLoginUserOutput,
  error: zToBackendLoginUserError
}).meta({ id: 'ToBackendLoginUserResponse' });

assertTypesEqual<
  ToBackendLoginUserResponse,
  z.infer<typeof zToBackendLoginUserResponse>
>({ value: true });
