import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendConfirmUserEmailError,
  zToBackendConfirmUserEmailError
} from './confirm-user-email-error';

export type ToBackendConfirmUserEmailOutput = {
  token?: string;
  user?: User;
};

export type ToBackendConfirmUserEmailResponse = ToBackendResponse<
  ToBackendConfirmUserEmailOutput,
  ToBackendConfirmUserEmailError
>;

export let zToBackendConfirmUserEmailOutput = z
  .object({
    token: z.string().nullish(),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendConfirmUserEmailOutput' });

export let zToBackendConfirmUserEmailResponse = makeToBackendResponseSchema({
  success: zToBackendConfirmUserEmailOutput,
  error: zToBackendConfirmUserEmailError
}).meta({ id: 'ToBackendConfirmUserEmailResponse' });

assertTypesEqual<
  ToBackendConfirmUserEmailOutput,
  z.infer<typeof zToBackendConfirmUserEmailOutput>
>({ value: true });

assertTypesEqual<
  ToBackendConfirmUserEmailResponse,
  z.infer<typeof zToBackendConfirmUserEmailResponse>
>({ value: true });
