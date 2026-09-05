import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskDeleteFileRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  fileNodeId: string;
  userAlias: string;
};

export let zToDiskDeleteFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fileNodeId: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskDeleteFileRequestPayload' });

assertTypesEqual<
  ToDiskDeleteFileRequestPayload,
  z.infer<typeof zToDiskDeleteFileRequestPayload>
>({ value: true });
