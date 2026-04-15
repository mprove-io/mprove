import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskPushRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    userAlias: z.string()
  })
  .meta({ id: 'ToDiskPushRepoRequestPayload' });

export let zToDiskPushRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskPushRepoRequestPayload
  })
  .meta({ id: 'ToDiskPushRepoRequest' });

export let zToDiskPushRepoResponsePayload = z
  .object({
    repo: zRepo,
    productionFiles: z.array(zDiskCatalogFile),
    productionMproveDir: z.string()
  })
  .meta({ id: 'ToDiskPushRepoResponsePayload' });

export let zToDiskPushRepoResponse = zMyResponse
  .extend({
    payload: zToDiskPushRepoResponsePayload
  })
  .meta({ id: 'ToDiskPushRepoResponse' });

export type ToDiskPushRepoRequestPayload = z.infer<
  typeof zToDiskPushRepoRequestPayload
>;
export type ToDiskPushRepoRequest = z.infer<typeof zToDiskPushRepoRequest>;
export type ToDiskPushRepoResponsePayload = z.infer<
  typeof zToDiskPushRepoResponsePayload
>;
export type ToDiskPushRepoResponse = z.infer<typeof zToDiskPushRepoResponse>;
