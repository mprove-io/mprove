import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendUpdateUserPasswordError,
  zToBackendUpdateUserPasswordError
} from './update-user-password-error';

export type ToBackendUpdateUserPasswordOutput = Record<string, never>;

export type ToBackendUpdateUserPasswordResponse = ToBackendResponse<
  ToBackendUpdateUserPasswordOutput,
  ToBackendUpdateUserPasswordError
>;

export let zToBackendUpdateUserPasswordOutput = z
  .object({})
  .meta({ id: 'ToBackendUpdateUserPasswordOutput' });

export let zToBackendUpdateUserPasswordResponse = makeToBackendResponseSchema({
  success: zToBackendUpdateUserPasswordOutput,
  error: zToBackendUpdateUserPasswordError
}).meta({ id: 'ToBackendUpdateUserPasswordResponse' });

assertTypesEqual<
  ToBackendUpdateUserPasswordOutput,
  z.infer<typeof zToBackendUpdateUserPasswordOutput>
>({ value: true });

assertTypesEqual<
  ToBackendUpdateUserPasswordResponse,
  z.infer<typeof zToBackendUpdateUserPasswordResponse>
>({ value: true });
