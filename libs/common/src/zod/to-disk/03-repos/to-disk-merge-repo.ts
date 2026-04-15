import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

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

export let zToDiskMergeRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskMergeRepoRequestPayload
  })
  .meta({ id: 'ToDiskMergeRepoRequest' });

export let zToDiskMergeRepoResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskMergeRepoResponsePayload' });

export let zToDiskMergeRepoResponse = zMyResponse
  .extend({
    payload: zToDiskMergeRepoResponsePayload
  })
  .meta({ id: 'ToDiskMergeRepoResponse' });

export type ToDiskMergeRepoRequestPayload = z.infer<
  typeof zToDiskMergeRepoRequestPayload
>;
export type ToDiskMergeRepoRequest = z.infer<typeof zToDiskMergeRepoRequest>;
export type ToDiskMergeRepoResponsePayload = z.infer<
  typeof zToDiskMergeRepoResponsePayload
>;
export type ToDiskMergeRepoResponse = z.infer<typeof zToDiskMergeRepoResponse>;
