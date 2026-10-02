import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteSessionOutput,
  zToBackendDeleteSessionOutput
} from '#common/types/backend/routes/sessions/delete-session/delete-session-output';
import {
  type ToBackendDeleteSessionError,
  zToBackendDeleteSessionError
} from './delete-session-error';

export type ToBackendDeleteSessionResponse = ToBackendResponseBase<
  'deleteSession',
  ToBackendDeleteSessionOutput,
  ToBackendDeleteSessionError
>;

export let zToBackendDeleteSessionResponse = makeToBackendResponseSchema({
  operation: 'deleteSession',
  output: zToBackendDeleteSessionOutput,
  error: zToBackendDeleteSessionError
}).meta({ id: 'ToBackendDeleteSessionResponse' });

assertTypesEqual<
  ToBackendDeleteSessionResponse,
  z.infer<typeof zToBackendDeleteSessionResponse>
>({ value: true });
