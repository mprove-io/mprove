import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskCommitRepoRequest = {
  operation: 'commitRepo';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    userAlias: string;
    commitMessage: string;
  };
};

export let zToDiskCommitRepoRequest = z
  .strictObject({
    operation: z.literal('commitRepo'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        userAlias: z.string(),
        commitMessage: z.string()
      })
      .meta({ id: 'ToDiskCommitRepoRequestInput' })
  })
  .meta({ id: 'ToDiskCommitRepoRequest' });

assertTypesEqual<
  ToDiskCommitRepoRequest,
  z.infer<typeof zToDiskCommitRepoRequest>
>({ value: true });
