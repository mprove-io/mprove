import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCompleteUserRegistrationOutput,
  zToBackendCompleteUserRegistrationOutput
} from '#common/zod/backend/routes/users/complete-user-registration/complete-user-registration-output';
import {
  type ToBackendCompleteUserRegistrationError,
  zToBackendCompleteUserRegistrationError
} from './complete-user-registration-error';

export type ToBackendCompleteUserRegistrationResponse = ToBackendResponseBase<
  'completeUserRegistration',
  ToBackendCompleteUserRegistrationOutput,
  ToBackendCompleteUserRegistrationError
>;

export let zToBackendCompleteUserRegistrationResponse =
  makeToBackendResponseSchema({
    operation: 'completeUserRegistration',
    output: zToBackendCompleteUserRegistrationOutput,
    error: zToBackendCompleteUserRegistrationError
  }).meta({ id: 'ToBackendCompleteUserRegistrationResponse' });

assertTypesEqual<
  ToBackendCompleteUserRegistrationResponse,
  z.infer<typeof zToBackendCompleteUserRegistrationResponse>
>({ value: true });
