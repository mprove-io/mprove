import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCheckSignUpError,
  zToBackendCheckSignUpError
} from './check-sign-up-error';

export type ToBackendCheckSignUpOutput = {
  isRegisterOnlyInvitedUsers: boolean;
};

export type ToBackendCheckSignUpResponse = ToBackendResponse<
  ToBackendCheckSignUpOutput,
  ToBackendCheckSignUpError
>;

export let zToBackendCheckSignUpOutput = z
  .object({
    isRegisterOnlyInvitedUsers: z.boolean()
  })
  .meta({ id: 'ToBackendCheckSignUpOutput' });

export let zToBackendCheckSignUpResponse = makeToBackendResponseSchema({
  success: zToBackendCheckSignUpOutput,
  error: zToBackendCheckSignUpError
}).meta({ id: 'ToBackendCheckSignUpResponse' });

assertTypesEqual<
  ToBackendCheckSignUpOutput,
  z.infer<typeof zToBackendCheckSignUpOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCheckSignUpResponse,
  z.infer<typeof zToBackendCheckSignUpResponse>
>({ value: true });
