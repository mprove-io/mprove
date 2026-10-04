import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';
import { zProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';

export type ToBackendCreateProjectRequest = {
  operation: 'createProject';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
    name: string;
    remoteType: ProjectRemoteType;
    gitUrl?: string;
    noteId?: string;
  };
};

export let zToBackendCreateProjectRequest = z
  .strictObject({
    operation: z.literal('createProject'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string(),
        name: z.string(),
        remoteType: zProjectRemoteType,
        gitUrl: z.string().nullish(),
        noteId: z.string().nullish()
      })
      .meta({ id: 'ToBackendCreateProjectInput' })
  })
  .meta({ id: 'ToBackendCreateProjectRequest' });

assertTypesEqual<
  ToBackendCreateProjectRequest,
  z.infer<typeof zToBackendCreateProjectRequest>
>({ value: true });
