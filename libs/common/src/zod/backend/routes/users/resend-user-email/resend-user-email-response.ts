import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendResendUserEmailError,
  zToBackendResendUserEmailError
} from './resend-user-email-error';

export type ToBackendResendUserEmailOutput = {
  isEmailVerified: boolean;
};

export type ToBackendResendUserEmailResponse = ToBackendResponse<
  ToBackendResendUserEmailOutput,
  ToBackendResendUserEmailError
>;

export let zToBackendResendUserEmailOutput = z
  .object({
    isEmailVerified: z.boolean()
  })
  .meta({ id: 'ToBackendResendUserEmailOutput' });

export let zToBackendResendUserEmailResponse = makeToBackendResponseSchema({
  success: zToBackendResendUserEmailOutput,
  error: zToBackendResendUserEmailError
}).meta({ id: 'ToBackendResendUserEmailResponse' });

assertTypesEqual<
  ToBackendResendUserEmailOutput,
  z.infer<typeof zToBackendResendUserEmailOutput>
>({ value: true });

assertTypesEqual<
  ToBackendResendUserEmailResponse,
  z.infer<typeof zToBackendResendUserEmailResponse>
>({ value: true });
