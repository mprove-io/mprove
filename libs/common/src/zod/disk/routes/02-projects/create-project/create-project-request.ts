import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskCreateProjectRequest = {
  operation: 'createProject';
  traceId: string;
  input: {
    baseProject: BaseProject;
    seedProjectId?: string;
    devRepoId: string;
    userAlias: string;
  };
};

export let zToDiskCreateProjectRequest = z
  .strictObject({
    operation: z.literal('createProject'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        seedProjectId: z.string().nullish(),
        devRepoId: z.string(),
        userAlias: z.string()
      })
      .meta({ id: 'ToDiskCreateProjectRequestInput' })
  })
  .meta({ id: 'ToDiskCreateProjectRequest' });

assertTypesEqual<
  ToDiskCreateProjectRequest,
  z.infer<typeof zToDiskCreateProjectRequest>
>({ value: true });
