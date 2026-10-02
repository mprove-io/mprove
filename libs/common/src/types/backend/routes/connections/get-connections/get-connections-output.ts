import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/member';
import {
  type ProjectConnection,
  zProjectConnection
} from '#common/types/backend/project-connection';

export type ToBackendGetConnectionsOutput = {
  userMember: Member;
  connections: ProjectConnection[];
};

export let zToBackendGetConnectionsOutput = z
  .object({
    userMember: zMember,
    connections: z.array(zProjectConnection)
  })
  .meta({ id: 'ToBackendGetConnectionsOutput' });

assertTypesEqual<
  ToBackendGetConnectionsOutput,
  z.infer<typeof zToBackendGetConnectionsOutput>
>({ value: true });
