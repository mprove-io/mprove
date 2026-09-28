import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendResendUserEmailOutput,
  zToBackendResendUserEmailOutput
} from '#common/zod/backend/routes/users/resend-user-email/resend-user-email-output';
import {
  type ToBackendResendUserEmailError,
  zToBackendResendUserEmailError
} from './resend-user-email-error';

export type ToBackendResendUserEmailResponse = ToBackendResponseBase<
  'resendUserEmail',
  ToBackendResendUserEmailOutput,
  ToBackendResendUserEmailError
>;

export let zToBackendResendUserEmailResponse = makeToBackendResponseSchema({
  operation: 'resendUserEmail',
  output: zToBackendResendUserEmailOutput,
  error: zToBackendResendUserEmailError
}).meta({ id: 'ToBackendResendUserEmailResponse' });

assertTypesEqual<
  ToBackendResendUserEmailResponse,
  z.infer<typeof zToBackendResendUserEmailResponse>
>({ value: true });
