import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetConnectionsListOutput,
  zToBackendGetConnectionsListOutput
} from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-output';
import {
  type ToBackendGetConnectionsListError,
  zToBackendGetConnectionsListError
} from './get-connections-list-error';

export type ToBackendGetConnectionsListResponse = ToBackendResponseBase<
  'getConnectionsList',
  ToBackendGetConnectionsListOutput,
  ToBackendGetConnectionsListError
>;

export let zToBackendGetConnectionsListResponse = makeToBackendResponseSchema({
  operation: 'getConnectionsList',
  output: zToBackendGetConnectionsListOutput,
  error: zToBackendGetConnectionsListError
}).meta({ id: 'ToBackendGetConnectionsListResponse' });

assertTypesEqual<
  ToBackendGetConnectionsListResponse,
  z.infer<typeof zToBackendGetConnectionsListResponse>
>({ value: true });
