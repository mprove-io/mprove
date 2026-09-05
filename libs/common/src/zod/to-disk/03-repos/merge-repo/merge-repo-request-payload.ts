import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskMergeRepoRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  theirBranch: string;
  isTheirBranchRemote: boolean;
  userAlias: string;
};

export let zToDiskMergeRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    theirBranch: z.string(),
    isTheirBranchRemote: z.boolean(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskMergeRepoRequestPayload' });

assertTypesEqual<
  ToDiskMergeRepoRequestPayload,
  z.infer<typeof zToDiskMergeRepoRequestPayload>
>({ value: true });
