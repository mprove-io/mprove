import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskCreateFolderRequest = {
  operation: 'createFolder';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    parentNodeId: string;
    folderName: string;
  };
};

export let zToDiskCreateFolderRequest = z
  .strictObject({
    operation: z.literal('createFolder'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        parentNodeId: z.string(),
        folderName: z.string()
      })
      .meta({ id: 'ToDiskCreateFolderRequestInput' })
  })
  .meta({ id: 'ToDiskCreateFolderRequest' });

assertTypesEqual<
  ToDiskCreateFolderRequest,
  z.infer<typeof zToDiskCreateFolderRequest>
>({ value: true });
