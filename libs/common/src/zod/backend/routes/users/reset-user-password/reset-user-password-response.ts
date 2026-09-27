import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendResetUserPasswordError,
  zToBackendResetUserPasswordError
} from './reset-user-password-error';

export type ToBackendResetUserPasswordOutput = Record<string, never>;

export type ToBackendResetUserPasswordResponse = ToBackendResponse<
  ToBackendResetUserPasswordOutput,
  ToBackendResetUserPasswordError
>;

export let zToBackendResetUserPasswordOutput = z
  .object({})
  .meta({ id: 'ToBackendResetUserPasswordOutput' });

export let zToBackendResetUserPasswordResponse = makeToBackendResponseSchema({
  success: zToBackendResetUserPasswordOutput,
  error: zToBackendResetUserPasswordError
}).meta({ id: 'ToBackendResetUserPasswordResponse' });

assertTypesEqual<
  ToBackendResetUserPasswordOutput,
  z.infer<typeof zToBackendResetUserPasswordOutput>
>({ value: true });

assertTypesEqual<
  ToBackendResetUserPasswordResponse,
  z.infer<typeof zToBackendResetUserPasswordResponse>
>({ value: true });
