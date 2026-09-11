import { z } from 'zod';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskGetFileRequest = {
  operation: 'getFile';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fileNodeId: string;
    builderLeft:
      | BuilderLeftEnum.Tree
      | BuilderLeftEnum.ChangesToCommit
      | BuilderLeftEnum.ChangesToPush
      | BuilderLeftEnum.Info;
  };
};

export let zToDiskGetFileRequest = z
  .strictObject({
    operation: z.literal('getFile'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        fileNodeId: z.string(),
        builderLeft: z.enum(BuilderLeftEnum)
      })
      .meta({ id: 'ToDiskGetFileRequestInput' })
  })
  .meta({ id: 'ToDiskGetFileRequest' });

assertTypesEqual<ToDiskGetFileRequest, z.infer<typeof zToDiskGetFileRequest>>({
  value: true
});
