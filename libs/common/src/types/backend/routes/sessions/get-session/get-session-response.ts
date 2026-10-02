import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetSessionOutput,
  zToBackendGetSessionOutput
} from '#common/types/backend/routes/sessions/get-session/get-session-output';
import {
  type ToBackendGetSessionError,
  zToBackendGetSessionError
} from './get-session-error';

export type ToBackendGetSessionResponse = ToBackendResponseBase<
  'getSession',
  ToBackendGetSessionOutput,
  ToBackendGetSessionError
>;

export let zToBackendGetSessionResponse = makeToBackendResponseSchema({
  operation: 'getSession',
  output: zToBackendGetSessionOutput,
  error: zToBackendGetSessionError
}).meta({ id: 'ToBackendGetSessionResponse' });

assertTypesEqual<
  ToBackendGetSessionResponse,
  z.infer<typeof zToBackendGetSessionResponse>
>({ value: true });
