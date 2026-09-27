import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteSessionError,
  zToBackendDeleteSessionError
} from './delete-session-error';

export type ToBackendDeleteSessionOutput = Record<string, never>;

export type ToBackendDeleteSessionResponse = ToBackendResponse<
  ToBackendDeleteSessionOutput,
  ToBackendDeleteSessionError
>;

export let zToBackendDeleteSessionOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteSessionOutput' });

export let zToBackendDeleteSessionResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteSessionOutput,
  error: zToBackendDeleteSessionError
}).meta({ id: 'ToBackendDeleteSessionResponse' });

assertTypesEqual<
  ToBackendDeleteSessionOutput,
  z.infer<typeof zToBackendDeleteSessionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteSessionResponse,
  z.infer<typeof zToBackendDeleteSessionResponse>
>({ value: true });
