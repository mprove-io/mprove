import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskPullRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskPullRepoRequestPayload' });

export let zToDiskPullRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskPullRepoRequestPayload
  })
  .meta({ id: 'ToDiskPullRepoRequest' });

export let zToDiskPullRepoResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string()
  })
  .meta({ id: 'ToDiskPullRepoResponsePayload' });

export let zToDiskPullRepoResponse = zMyResponse
  .extend({
    payload: zToDiskPullRepoResponsePayload
  })
  .meta({ id: 'ToDiskPullRepoResponse' });

export type ToDiskPullRepoRequestPayload = z.infer<
  typeof zToDiskPullRepoRequestPayload
>;
export type ToDiskPullRepoRequest = z.infer<typeof zToDiskPullRepoRequest>;
export type ToDiskPullRepoResponsePayload = z.infer<
  typeof zToDiskPullRepoResponsePayload
>;
export type ToDiskPullRepoResponse = z.infer<typeof zToDiskPullRepoResponse>;
