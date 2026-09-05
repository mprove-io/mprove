import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { BaseProject } from '#common/zod/backend/base-project';
import { zBaseProject } from '#common/zod/backend/base-project';

export type ToDiskCommitRepoRequestPayload = {
  orgId: string;
  baseProject: BaseProject;
  repoId: string;
  branch: string;
  userAlias: string;
  commitMessage: string;
};

export let zToDiskCommitRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    userAlias: z.string(),
    commitMessage: z.string()
  })
  .meta({ id: 'ToDiskCommitRepoRequestPayload' });

assertTypesEqual<
  ToDiskCommitRepoRequestPayload,
  z.infer<typeof zToDiskCommitRepoRequestPayload>
>({ value: true });
