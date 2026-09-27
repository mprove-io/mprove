import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendCompleteUserRegistrationError,
  zToBackendCompleteUserRegistrationError
} from './complete-user-registration-error';

export type ToBackendCompleteUserRegistrationOutput = {
  token?: string;
  user?: User;
};

export type ToBackendCompleteUserRegistrationResponse = ToBackendResponse<
  ToBackendCompleteUserRegistrationOutput,
  ToBackendCompleteUserRegistrationError
>;

export let zToBackendCompleteUserRegistrationOutput = z
  .object({
    token: z.string().nullish(),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationOutput' });

export let zToBackendCompleteUserRegistrationResponse =
  makeToBackendResponseSchema({
    success: zToBackendCompleteUserRegistrationOutput,
    error: zToBackendCompleteUserRegistrationError
  }).meta({ id: 'ToBackendCompleteUserRegistrationResponse' });

assertTypesEqual<
  ToBackendCompleteUserRegistrationOutput,
  z.infer<typeof zToBackendCompleteUserRegistrationOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCompleteUserRegistrationResponse,
  z.infer<typeof zToBackendCompleteUserRegistrationResponse>
>({ value: true });
