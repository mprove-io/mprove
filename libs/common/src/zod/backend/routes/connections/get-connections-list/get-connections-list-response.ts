import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionItem,
  zConnectionItem
} from '#common/zod/backend/connections/connection-item';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetConnectionsListError,
  zToBackendGetConnectionsListError
} from './get-connections-list-error';

export type ToBackendGetConnectionsListOutput = {
  connectionItems: ConnectionItem[];
};

export type ToBackendGetConnectionsListResponse = ToBackendResponse<
  ToBackendGetConnectionsListOutput,
  ToBackendGetConnectionsListError
>;

export let zToBackendGetConnectionsListOutput = z
  .object({
    connectionItems: z.array(zConnectionItem)
  })
  .meta({ id: 'ToBackendGetConnectionsListOutput' });

export let zToBackendGetConnectionsListResponse = makeToBackendResponseSchema({
  success: zToBackendGetConnectionsListOutput,
  error: zToBackendGetConnectionsListError
}).meta({ id: 'ToBackendGetConnectionsListResponse' });

assertTypesEqual<
  ToBackendGetConnectionsListOutput,
  z.infer<typeof zToBackendGetConnectionsListOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionsListResponse,
  z.infer<typeof zToBackendGetConnectionsListResponse>
>({ value: true });
