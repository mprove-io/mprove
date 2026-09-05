import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskCreateFolderRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  parentNodeId: string;
  folderName: string;
};

export let zToDiskCreateFolderRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    parentNodeId: z.string(),
    folderName: z.string()
  })
  .meta({ id: 'ToDiskCreateFolderRequestPayload' });

assertTypesEqual<
  ToDiskCreateFolderRequestPayload,
  z.infer<typeof zToDiskCreateFolderRequestPayload>
>({ value: true });
