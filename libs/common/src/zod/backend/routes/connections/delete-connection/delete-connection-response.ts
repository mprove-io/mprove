import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteConnectionError,
  zToBackendDeleteConnectionError
} from './delete-connection-error';

export type ToBackendDeleteConnectionOutput = Record<string, never>;

export type ToBackendDeleteConnectionResponse = ToBackendResponse<
  ToBackendDeleteConnectionOutput,
  ToBackendDeleteConnectionError
>;

export let zToBackendDeleteConnectionOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteConnectionOutput' });

export let zToBackendDeleteConnectionResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteConnectionOutput,
  error: zToBackendDeleteConnectionError
}).meta({ id: 'ToBackendDeleteConnectionResponse' });

assertTypesEqual<
  ToBackendDeleteConnectionOutput,
  z.infer<typeof zToBackendDeleteConnectionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteConnectionResponse,
  z.infer<typeof zToBackendDeleteConnectionResponse>
>({ value: true });
