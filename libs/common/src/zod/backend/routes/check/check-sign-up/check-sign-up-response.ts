import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCheckSignUpOutput,
  zToBackendCheckSignUpOutput
} from '#common/zod/backend/routes/check/check-sign-up/check-sign-up-output';
import {
  type ToBackendCheckSignUpError,
  zToBackendCheckSignUpError
} from './check-sign-up-error';

export type ToBackendCheckSignUpResponse = ToBackendResponseBase<
  'checkSignUp',
  ToBackendCheckSignUpOutput,
  ToBackendCheckSignUpError
>;

export let zToBackendCheckSignUpResponse = makeToBackendResponseSchema({
  operation: 'checkSignUp',
  output: zToBackendCheckSignUpOutput,
  error: zToBackendCheckSignUpError
}).meta({ id: 'ToBackendCheckSignUpResponse' });

assertTypesEqual<
  ToBackendCheckSignUpResponse,
  z.infer<typeof zToBackendCheckSignUpResponse>
>({ value: true });
