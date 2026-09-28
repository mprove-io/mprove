import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendRegisterUserOutput,
  zToBackendRegisterUserOutput
} from '#common/zod/backend/routes/users/register-user/register-user-output';
import {
  type ToBackendRegisterUserError,
  zToBackendRegisterUserError
} from './register-user-error';

export type ToBackendRegisterUserResponse = ToBackendResponseBase<
  'registerUser',
  ToBackendRegisterUserOutput,
  ToBackendRegisterUserError
>;

export let zToBackendRegisterUserResponse = makeToBackendResponseSchema({
  operation: 'registerUser',
  output: zToBackendRegisterUserOutput,
  error: zToBackendRegisterUserError
}).meta({ id: 'ToBackendRegisterUserResponse' });

assertTypesEqual<
  ToBackendRegisterUserResponse,
  z.infer<typeof zToBackendRegisterUserResponse>
>({ value: true });
