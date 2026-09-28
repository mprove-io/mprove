import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetConnectionsOutput,
  zToBackendGetConnectionsOutput
} from '#common/zod/backend/routes/connections/get-connections/get-connections-output';
import {
  type ToBackendGetConnectionsError,
  zToBackendGetConnectionsError
} from './get-connections-error';

export type ToBackendGetConnectionsResponse = ToBackendResponseBase<
  'getConnections',
  ToBackendGetConnectionsOutput,
  ToBackendGetConnectionsError
>;

export let zToBackendGetConnectionsResponse = makeToBackendResponseSchema({
  operation: 'getConnections',
  output: zToBackendGetConnectionsOutput,
  error: zToBackendGetConnectionsError
}).meta({ id: 'ToBackendGetConnectionsResponse' });

assertTypesEqual<
  ToBackendGetConnectionsResponse,
  z.infer<typeof zToBackendGetConnectionsResponse>
>({ value: true });
