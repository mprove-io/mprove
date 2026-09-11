import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskDeleteFolderRequest = {
  operation: 'deleteFolder';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    folderNodeId: string;
  };
};

export let zToDiskDeleteFolderRequest = z
  .strictObject({
    operation: z.literal('deleteFolder'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        folderNodeId: z.string()
      })
      .meta({ id: 'ToDiskDeleteFolderRequestInput' })
  })
  .meta({ id: 'ToDiskDeleteFolderRequest' });

assertTypesEqual<
  ToDiskDeleteFolderRequest,
  z.infer<typeof zToDiskDeleteFolderRequest>
>({ value: true });
