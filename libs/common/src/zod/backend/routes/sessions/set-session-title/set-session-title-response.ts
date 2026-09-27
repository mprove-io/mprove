import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSetSessionTitleError,
  zToBackendSetSessionTitleError
} from './set-session-title-error';

export type ToBackendSetSessionTitleOutput = Record<string, never>;

export type ToBackendSetSessionTitleResponse = ToBackendResponse<
  ToBackendSetSessionTitleOutput,
  ToBackendSetSessionTitleError
>;

export let zToBackendSetSessionTitleOutput = z
  .object({})
  .meta({ id: 'ToBackendSetSessionTitleOutput' });

export let zToBackendSetSessionTitleResponse = makeToBackendResponseSchema({
  success: zToBackendSetSessionTitleOutput,
  error: zToBackendSetSessionTitleError
}).meta({ id: 'ToBackendSetSessionTitleResponse' });

assertTypesEqual<
  ToBackendSetSessionTitleOutput,
  z.infer<typeof zToBackendSetSessionTitleOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSetSessionTitleResponse,
  z.infer<typeof zToBackendSetSessionTitleResponse>
>({ value: true });
