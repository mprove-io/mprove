import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskDeleteFileRequest = {
  operation: 'deleteFile';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fileNodeId: string;
    userAlias: string;
  };
};

export let zToDiskDeleteFileRequest = z
  .strictObject({
    operation: z.literal('deleteFile'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        fileNodeId: z.string(),
        userAlias: z.string()
      })
      .meta({ id: 'ToDiskDeleteFileRequestInput' })
  })
  .meta({ id: 'ToDiskDeleteFileRequest' });

assertTypesEqual<
  ToDiskDeleteFileRequest,
  z.infer<typeof zToDiskDeleteFileRequest>
>({ value: true });
