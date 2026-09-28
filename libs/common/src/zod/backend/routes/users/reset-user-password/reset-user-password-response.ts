import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendResetUserPasswordOutput,
  zToBackendResetUserPasswordOutput
} from '#common/zod/backend/routes/users/reset-user-password/reset-user-password-output';
import {
  type ToBackendResetUserPasswordError,
  zToBackendResetUserPasswordError
} from './reset-user-password-error';

export type ToBackendResetUserPasswordResponse = ToBackendResponseBase<
  'resetUserPassword',
  ToBackendResetUserPasswordOutput,
  ToBackendResetUserPasswordError
>;

export let zToBackendResetUserPasswordResponse = makeToBackendResponseSchema({
  operation: 'resetUserPassword',
  output: zToBackendResetUserPasswordOutput,
  error: zToBackendResetUserPasswordError
}).meta({ id: 'ToBackendResetUserPasswordResponse' });

assertTypesEqual<
  ToBackendResetUserPasswordResponse,
  z.infer<typeof zToBackendResetUserPasswordResponse>
>({ value: true });
