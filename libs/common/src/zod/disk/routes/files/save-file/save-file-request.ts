import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskSaveFileRequest = {
  operation: 'saveFile';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fileNodeId: string;
    content: string;
    userAlias: string;
  };
};

export let zToDiskSaveFileRequest = z
  .strictObject({
    operation: z.literal('saveFile'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        fileNodeId: z.string(),
        content: z.string(),
        userAlias: z.string()
      })
      .meta({ id: 'ToDiskSaveFileRequestInput' })
  })
  .meta({ id: 'ToDiskSaveFileRequest' });

assertTypesEqual<ToDiskSaveFileRequest, z.infer<typeof zToDiskSaveFileRequest>>(
  { value: true }
);
