import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendSetUserNameError,
  zToBackendSetUserNameError
} from './set-user-name-error';

export type ToBackendSetUserNameOutput = {
  user: User;
};

export type ToBackendSetUserNameResponse = ToBackendResponse<
  ToBackendSetUserNameOutput,
  ToBackendSetUserNameError
>;

export let zToBackendSetUserNameOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserNameOutput' });

export let zToBackendSetUserNameResponse = makeToBackendResponseSchema({
  success: zToBackendSetUserNameOutput,
  error: zToBackendSetUserNameError
}).meta({ id: 'ToBackendSetUserNameResponse' });

assertTypesEqual<
  ToBackendSetUserNameOutput,
  z.infer<typeof zToBackendSetUserNameOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetUserNameResponse,
  z.infer<typeof zToBackendSetUserNameResponse>
>({ value: true });
