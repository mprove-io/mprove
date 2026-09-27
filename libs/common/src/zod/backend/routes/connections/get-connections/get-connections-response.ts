import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  type ProjectConnection,
  zProjectConnection
} from '#common/zod/backend/project-connection';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetConnectionsError,
  zToBackendGetConnectionsError
} from './get-connections-error';

export type ToBackendGetConnectionsOutput = {
  userMember: Member;
  connections: ProjectConnection[];
};

export type ToBackendGetConnectionsResponse = ToBackendResponse<
  ToBackendGetConnectionsOutput,
  ToBackendGetConnectionsError
>;

export let zToBackendGetConnectionsOutput = z
  .object({
    userMember: zMember,
    connections: z.array(zProjectConnection)
  })
  .meta({ id: 'ToBackendGetConnectionsOutput' });

export let zToBackendGetConnectionsResponse = makeToBackendResponseSchema({
  success: zToBackendGetConnectionsOutput,
  error: zToBackendGetConnectionsError
}).meta({ id: 'ToBackendGetConnectionsResponse' });

assertTypesEqual<
  ToBackendGetConnectionsOutput,
  z.infer<typeof zToBackendGetConnectionsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionsResponse,
  z.infer<typeof zToBackendGetConnectionsResponse>
>({ value: true });
