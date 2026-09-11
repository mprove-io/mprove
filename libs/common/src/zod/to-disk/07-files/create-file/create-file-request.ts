import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskCreateFileRequest = {
  operation: 'createFile';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    userAlias: string;
    parentNodeId: string;
    fileName: string;
    fileText?: string;
  };
};

export let zToDiskCreateFileRequest = z
  .strictObject({
    operation: z.literal('createFile'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        userAlias: z.string(),
        parentNodeId: z.string(),
        fileName: z.string(),
        fileText: z.string().nullish()
      })
      .meta({ id: 'ToDiskCreateFileRequestInput' })
  })
  .meta({ id: 'ToDiskCreateFileRequest' });

assertTypesEqual<
  ToDiskCreateFileRequest,
  z.infer<typeof zToDiskCreateFileRequest>
>({ value: true });
