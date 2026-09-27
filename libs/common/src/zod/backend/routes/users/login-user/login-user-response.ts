import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendLoginUserError,
  zToBackendLoginUserError
} from './login-user-error';

export type ToBackendLoginUserOutput = {
  token: string;
  user: User;
};

export type ToBackendLoginUserResponse = ToBackendResponse<
  ToBackendLoginUserOutput,
  ToBackendLoginUserError
>;

export let zToBackendLoginUserOutput = z
  .object({
    token: z.string(),
    user: zUser
  })
  .meta({ id: 'ToBackendLoginUserOutput' });

export let zToBackendLoginUserResponse = makeToBackendResponseSchema({
  success: zToBackendLoginUserOutput,
  error: zToBackendLoginUserError
}).meta({ id: 'ToBackendLoginUserResponse' });

assertTypesEqual<
  ToBackendLoginUserOutput,
  z.infer<typeof zToBackendLoginUserOutput>
>({ value: true });

assertTypesEqual<
  ToBackendLoginUserResponse,
  z.infer<typeof zToBackendLoginUserResponse>
>({ value: true });
