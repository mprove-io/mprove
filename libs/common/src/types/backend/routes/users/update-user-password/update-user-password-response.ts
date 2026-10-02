import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendUpdateUserPasswordOutput,
  zToBackendUpdateUserPasswordOutput
} from '#common/types/backend/routes/users/update-user-password/update-user-password-output';
import {
  type ToBackendUpdateUserPasswordError,
  zToBackendUpdateUserPasswordError
} from './update-user-password-error';

export type ToBackendUpdateUserPasswordResponse = ToBackendResponseBase<
  'updateUserPassword',
  ToBackendUpdateUserPasswordOutput,
  ToBackendUpdateUserPasswordError
>;

export let zToBackendUpdateUserPasswordResponse = makeToBackendResponseSchema({
  operation: 'updateUserPassword',
  output: zToBackendUpdateUserPasswordOutput,
  error: zToBackendUpdateUserPasswordError
}).meta({ id: 'ToBackendUpdateUserPasswordResponse' });

assertTypesEqual<
  ToBackendUpdateUserPasswordResponse,
  z.infer<typeof zToBackendUpdateUserPasswordResponse>
>({ value: true });
