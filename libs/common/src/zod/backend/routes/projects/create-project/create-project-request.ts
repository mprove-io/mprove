import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateProjectRequest = {
  operation: 'createProject';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
    name: string;
    remoteType: ProjectRemoteTypeEnum.Managed | ProjectRemoteTypeEnum.GitClone;
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
        remoteType: z.enum(ProjectRemoteTypeEnum),
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
