import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskCreateDevRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    devRepoId: z.string(),
    initialBranch: z.string().nullish(),
    sessionBranch: z.string().nullish()
  })
  .meta({ id: 'ToDiskCreateDevRepoRequestPayload' });

export let zToDiskCreateDevRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskCreateDevRepoRequestPayload
  })
  .meta({ id: 'ToDiskCreateDevRepoRequest' });

export let zToDiskCreateDevRepoResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    mproveDir: z.string(),
    initialCommitHash: z.string().nullish()
  })
  .meta({ id: 'ToDiskCreateDevRepoResponsePayload' });

export let zToDiskCreateDevRepoResponse = zMyResponse
  .extend({
    payload: zToDiskCreateDevRepoResponsePayload
  })
  .meta({ id: 'ToDiskCreateDevRepoResponse' });

export type ToDiskCreateDevRepoRequestPayload = z.infer<
  typeof zToDiskCreateDevRepoRequestPayload
>;
export type ToDiskCreateDevRepoRequest = z.infer<
  typeof zToDiskCreateDevRepoRequest
>;
export type ToDiskCreateDevRepoResponsePayload = z.infer<
  typeof zToDiskCreateDevRepoResponsePayload
>;
export type ToDiskCreateDevRepoResponse = z.infer<
  typeof zToDiskCreateDevRepoResponse
>;
