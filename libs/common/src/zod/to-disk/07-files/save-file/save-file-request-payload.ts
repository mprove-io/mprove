import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskSaveFileRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  fileNodeId: string;
  content: string;
  userAlias: string;
};

export let zToDiskSaveFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fileNodeId: z.string(),
    content: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskSaveFileRequestPayload' });

assertTypesEqual<
  ToDiskSaveFileRequestPayload,
  z.infer<typeof zToDiskSaveFileRequestPayload>
>({ value: true });
