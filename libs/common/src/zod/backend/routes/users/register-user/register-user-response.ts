import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendRegisterUserError,
  zToBackendRegisterUserError
} from './register-user-error';

export type ToBackendRegisterUserOutput = {
  user: User;
};

export type ToBackendRegisterUserResponse = ToBackendResponse<
  ToBackendRegisterUserOutput,
  ToBackendRegisterUserError
>;

export let zToBackendRegisterUserOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendRegisterUserOutput' });

export let zToBackendRegisterUserResponse = makeToBackendResponseSchema({
  success: zToBackendRegisterUserOutput,
  error: zToBackendRegisterUserError
}).meta({ id: 'ToBackendRegisterUserResponse' });

assertTypesEqual<
  ToBackendRegisterUserOutput,
  z.infer<typeof zToBackendRegisterUserOutput>
>({ value: true });

assertTypesEqual<
  ToBackendRegisterUserResponse,
  z.infer<typeof zToBackendRegisterUserResponse>
>({ value: true });
