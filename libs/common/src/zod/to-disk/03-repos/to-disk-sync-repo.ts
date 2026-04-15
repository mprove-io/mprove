import { z } from 'zod';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zDiskCatalogFile } from '#common/zod/disk/disk-catalog-file';
import { zDiskSyncFile } from '#common/zod/disk/disk-sync-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskSyncRepoRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    lastCommit: z.string(),
    lastSyncTime: z.number(),
    localChangedFiles: z.array(zDiskSyncFile),
    localDeletedFiles: z.array(zDiskSyncFile)
  })
  .meta({ id: 'ToDiskSyncRepoRequestPayload' });

export let zToDiskSyncRepoRequest = zToDiskRequest
  .extend({
    payload: zToDiskSyncRepoRequestPayload
  })
  .meta({ id: 'ToDiskSyncRepoRequest' });

export let zToDiskSyncRepoResponsePayload = z
  .object({
    repo: zRepo,
    files: z.array(zDiskCatalogFile),
    restChangedFiles: z.array(zDiskSyncFile),
    restDeletedFiles: z.array(zDiskSyncFile),
    mproveDir: z.string(),
    devReqReceiveTime: z.number(),
    devRespSentTime: z.number()
  })
  .meta({ id: 'ToDiskSyncRepoResponsePayload' });

export let zToDiskSyncRepoResponse = zMyResponse
  .extend({
    payload: zToDiskSyncRepoResponsePayload
  })
  .meta({ id: 'ToDiskSyncRepoResponse' });

export type ToDiskSyncRepoRequestPayload = z.infer<
  typeof zToDiskSyncRepoRequestPayload
>;
export type ToDiskSyncRepoRequest = z.infer<typeof zToDiskSyncRepoRequest>;
export type ToDiskSyncRepoResponsePayload = z.infer<
  typeof zToDiskSyncRepoResponsePayload
>;
export type ToDiskSyncRepoResponse = z.infer<typeof zToDiskSyncRepoResponse>;
