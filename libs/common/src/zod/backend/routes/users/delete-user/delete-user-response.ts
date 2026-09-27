import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteUserError,
  zToBackendDeleteUserError
} from './delete-user-error';

export type ToBackendDeleteUserOutput = Record<string, never>;

export type ToBackendDeleteUserResponse = ToBackendResponse<
  ToBackendDeleteUserOutput,
  ToBackendDeleteUserError
>;

export let zToBackendDeleteUserOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserOutput' });

export let zToBackendDeleteUserResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteUserOutput,
  error: zToBackendDeleteUserError
}).meta({ id: 'ToBackendDeleteUserResponse' });

assertTypesEqual<
  ToBackendDeleteUserOutput,
  z.infer<typeof zToBackendDeleteUserOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteUserResponse,
  z.infer<typeof zToBackendDeleteUserResponse>
>({ value: true });
