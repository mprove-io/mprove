import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendLogoutUserError,
  zToBackendLogoutUserError
} from './logout-user-error';

export type ToBackendLogoutUserOutput = Record<string, never>;

export type ToBackendLogoutUserResponse = ToBackendResponse<
  ToBackendLogoutUserOutput,
  ToBackendLogoutUserError
>;

export let zToBackendLogoutUserOutput = z
  .object({})
  .meta({ id: 'ToBackendLogoutUserOutput' });

export let zToBackendLogoutUserResponse = makeToBackendResponseSchema({
  success: zToBackendLogoutUserOutput,
  error: zToBackendLogoutUserError
}).meta({ id: 'ToBackendLogoutUserResponse' });

assertTypesEqual<
  ToBackendLogoutUserOutput,
  z.infer<typeof zToBackendLogoutUserOutput>
>({ value: true });

assertTypesEqual<
  ToBackendLogoutUserResponse,
  z.infer<typeof zToBackendLogoutUserResponse>
>({ value: true });
