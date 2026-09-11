import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskMergeRepoRequest = {
  operation: 'mergeRepo';
  traceId: string;
  input: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    theirBranch: string;
    isTheirBranchRemote: boolean;
    userAlias: string;
  };
};

export let zToDiskMergeRepoRequest = z
  .strictObject({
    operation: z.literal('mergeRepo'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        repoId: z.string(),
        branch: z.string(),
        theirBranch: z.string(),
        isTheirBranchRemote: z.boolean(),
        userAlias: z.string()
      })
      .meta({ id: 'ToDiskMergeRepoRequestInput' })
  })
  .meta({ id: 'ToDiskMergeRepoRequest' });

assertTypesEqual<
  ToDiskMergeRepoRequest,
  z.infer<typeof zToDiskMergeRepoRequest>
>({ value: true });
