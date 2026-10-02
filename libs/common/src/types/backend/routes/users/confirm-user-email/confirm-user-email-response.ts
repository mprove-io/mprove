import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendConfirmUserEmailOutput,
  zToBackendConfirmUserEmailOutput
} from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-output';
import {
  type ToBackendConfirmUserEmailError,
  zToBackendConfirmUserEmailError
} from './confirm-user-email-error';

export type ToBackendConfirmUserEmailResponse = ToBackendResponseBase<
  'confirmUserEmail',
  ToBackendConfirmUserEmailOutput,
  ToBackendConfirmUserEmailError
>;

export let zToBackendConfirmUserEmailResponse = makeToBackendResponseSchema({
  operation: 'confirmUserEmail',
  output: zToBackendConfirmUserEmailOutput,
  error: zToBackendConfirmUserEmailError
}).meta({ id: 'ToBackendConfirmUserEmailResponse' });

assertTypesEqual<
  ToBackendConfirmUserEmailResponse,
  z.infer<typeof zToBackendConfirmUserEmailResponse>
>({ value: true });
