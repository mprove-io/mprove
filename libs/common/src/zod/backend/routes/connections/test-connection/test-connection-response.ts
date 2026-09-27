import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type TestConnectionResult,
  zTestConnectionResult
} from '#common/zod/backend/connections/test-connection-result';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendTestConnectionError,
  zToBackendTestConnectionError
} from './test-connection-error';

export type ToBackendTestConnectionOutput = {
  testConnectionResult: TestConnectionResult;
};

export type ToBackendTestConnectionResponse = ToBackendResponse<
  ToBackendTestConnectionOutput,
  ToBackendTestConnectionError
>;

export let zToBackendTestConnectionOutput = z
  .object({
    testConnectionResult: zTestConnectionResult
  })
  .meta({ id: 'ToBackendTestConnectionOutput' });

export let zToBackendTestConnectionResponse = makeToBackendResponseSchema({
  success: zToBackendTestConnectionOutput,
  error: zToBackendTestConnectionError
}).meta({ id: 'ToBackendTestConnectionResponse' });

assertTypesEqual<
  ToBackendTestConnectionOutput,
  z.infer<typeof zToBackendTestConnectionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendTestConnectionResponse,
  z.infer<typeof zToBackendTestConnectionResponse>
>({ value: true });
