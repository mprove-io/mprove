import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskPushRepoRequest = {
  operation: 'pushRepo';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    userAlias: string;
  };
};

export let zToDiskPushRepoRequest = z
  .strictObject({
    operation: z.literal('pushRepo'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        userAlias: z.string()
      })
      .meta({ id: 'ToDiskPushRepoRequestInput' })
  })
  .meta({ id: 'ToDiskPushRepoRequest' });

assertTypesEqual<ToDiskPushRepoRequest, z.infer<typeof zToDiskPushRepoRequest>>(
  {
    value: true
  }
);
