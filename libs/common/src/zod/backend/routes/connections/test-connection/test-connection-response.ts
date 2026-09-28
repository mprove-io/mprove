import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendTestConnectionOutput,
  zToBackendTestConnectionOutput
} from '#common/zod/backend/routes/connections/test-connection/test-connection-output';
import {
  type ToBackendTestConnectionError,
  zToBackendTestConnectionError
} from './test-connection-error';

export type ToBackendTestConnectionResponse = ToBackendResponseBase<
  'testConnection',
  ToBackendTestConnectionOutput,
  ToBackendTestConnectionError
>;

export let zToBackendTestConnectionResponse = makeToBackendResponseSchema({
  operation: 'testConnection',
  output: zToBackendTestConnectionOutput,
  error: zToBackendTestConnectionError
}).meta({ id: 'ToBackendTestConnectionResponse' });

assertTypesEqual<
  ToBackendTestConnectionResponse,
  z.infer<typeof zToBackendTestConnectionResponse>
>({ value: true });
