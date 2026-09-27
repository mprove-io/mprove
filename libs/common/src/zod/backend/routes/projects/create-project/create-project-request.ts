import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateProjectInput = {
  orgId: string;
  name: string;
  remoteType: ProjectRemoteTypeEnum.Managed | ProjectRemoteTypeEnum.GitClone;
  gitUrl?: string;
  noteId?: string;
};

export type ToBackendCreateProjectRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateProjectInput;
};

export let zToBackendCreateProjectInput = z
  .object({
    orgId: z.string(),
    name: z.string(),
    remoteType: z.enum(ProjectRemoteTypeEnum),
    gitUrl: z.string().nullish(),
    noteId: z.string().nullish()
  })
  .meta({ id: 'ToBackendCreateProjectInput' });

export let zToBackendCreateProjectRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateProjectInput
  })
  .meta({ id: 'ToBackendCreateProjectRequest' });

assertTypesEqual<
  ToBackendCreateProjectInput,
  z.infer<typeof zToBackendCreateProjectInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateProjectRequest,
  z.infer<typeof zToBackendCreateProjectRequest>
>({ value: true });
