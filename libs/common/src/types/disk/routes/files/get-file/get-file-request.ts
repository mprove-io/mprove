import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/types/backend/parts/project/base-project';
import type { BuilderLeft } from '#common/types/front/builder/builder-left';
import { zBuilderLeft } from '#common/types/front/builder/builder-left';

export type ToDiskGetFileRequest = {
  operation: 'getFile';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fileNodeId: string;
    builderLeft: BuilderLeft;
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
        builderLeft: zBuilderLeft
      })
      .meta({ id: 'ToDiskGetFileRequestInput' })
  })
  .meta({ id: 'ToDiskGetFileRequest' });

assertTypesEqual<ToDiskGetFileRequest, z.infer<typeof zToDiskGetFileRequest>>({
  value: true
});
