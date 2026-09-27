import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendSetUserUiError,
  zToBackendSetUserUiError
} from './set-user-ui-error';

export type ToBackendSetUserUiOutput = {
  user: User;
};

export type ToBackendSetUserUiResponse = ToBackendResponse<
  ToBackendSetUserUiOutput,
  ToBackendSetUserUiError
>;

export let zToBackendSetUserUiOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserUiOutput' });

export let zToBackendSetUserUiResponse = makeToBackendResponseSchema({
  success: zToBackendSetUserUiOutput,
  error: zToBackendSetUserUiError
}).meta({ id: 'ToBackendSetUserUiResponse' });

assertTypesEqual<
  ToBackendSetUserUiOutput,
  z.infer<typeof zToBackendSetUserUiOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetUserUiResponse,
  z.infer<typeof zToBackendSetUserUiResponse>
>({ value: true });
