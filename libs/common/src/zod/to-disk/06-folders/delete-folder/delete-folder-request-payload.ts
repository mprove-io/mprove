import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskDeleteFolderRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  folderNodeId: string;
};

export let zToDiskDeleteFolderRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    folderNodeId: z.string()
  })
  .meta({ id: 'ToDiskDeleteFolderRequestPayload' });

assertTypesEqual<
  ToDiskDeleteFolderRequestPayload,
  z.infer<typeof zToDiskDeleteFolderRequestPayload>
>({ value: true });
