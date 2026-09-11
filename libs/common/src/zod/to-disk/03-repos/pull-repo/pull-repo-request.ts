import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskPullRepoRequest = {
  operation: 'pullRepo';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    userAlias: string;
  };
};

export let zToDiskPullRepoRequest = z
  .strictObject({
    operation: z.literal('pullRepo'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        userAlias: z.string()
      })
      .meta({ id: 'ToDiskPullRepoRequestInput' })
  })
  .meta({ id: 'ToDiskPullRepoRequest' });

assertTypesEqual<ToDiskPullRepoRequest, z.infer<typeof zToDiskPullRepoRequest>>(
  {
    value: true
  }
);
