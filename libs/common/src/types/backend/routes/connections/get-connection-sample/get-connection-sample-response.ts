import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetConnectionSampleOutput,
  zToBackendGetConnectionSampleOutput
} from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-output';
import {
  type ToBackendGetConnectionSampleError,
  zToBackendGetConnectionSampleError
} from './get-connection-sample-error';

export type ToBackendGetConnectionSampleResponse = ToBackendResponseBase<
  'getConnectionSample',
  ToBackendGetConnectionSampleOutput,
  ToBackendGetConnectionSampleError
>;

export let zToBackendGetConnectionSampleResponse = makeToBackendResponseSchema({
  operation: 'getConnectionSample',
  output: zToBackendGetConnectionSampleOutput,
  error: zToBackendGetConnectionSampleError
}).meta({ id: 'ToBackendGetConnectionSampleResponse' });

assertTypesEqual<
  ToBackendGetConnectionSampleResponse,
  z.infer<typeof zToBackendGetConnectionSampleResponse>
>({ value: true });
