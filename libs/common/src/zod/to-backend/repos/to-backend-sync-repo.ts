import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zDiskSyncFile } from '#common/zod/disk/disk-sync-file';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSyncRepoRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    lastCommit: z.string(),
    lastSyncTime: z.number(),
    envId: z.string(),
    localChangedFiles: z.array(zDiskSyncFile),
    localDeletedFiles: z.array(zDiskSyncFile)
  })
  .meta({ id: 'ToBackendSyncRepoRequestPayload' });

export let zToBackendSyncRepoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSyncRepo)
  })
  .meta({ id: 'ToBackendSyncRepoRequestInfo' });

export let zToBackendSyncRepoRequest = zToBackendRequest
  .extend({
    info: zToBackendSyncRepoRequestInfo,
    payload: zToBackendSyncRepoRequestPayload
  })
  .meta({ id: 'ToBackendSyncRepoRequest' });

export let zToBackendSyncRepoResponsePayload = z
  .object({
    restChangedFiles: z.array(zDiskSyncFile),
    restDeletedFiles: z.array(zDiskSyncFile),
    needValidate: z.boolean(),
    repo: zRepo,
    struct: zStructX,
    devReqReceiveTime: z.number(),
    devRespSentTime: z.number()
  })
  .meta({ id: 'ToBackendSyncRepoResponsePayload' });

export let zToBackendSyncRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSyncRepo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSyncRepoResponseInfo' });

export let zToBackendSyncRepoResponse = zMyResponse
  .extend({
    info: zToBackendSyncRepoResponseInfo,
    payload: zToBackendSyncRepoResponsePayload
  })
  .meta({ id: 'ToBackendSyncRepoResponse' });

export type ToBackendSyncRepoRequestPayload = z.infer<
  typeof zToBackendSyncRepoRequestPayload
>;
export type ToBackendSyncRepoRequest = z.infer<
  typeof zToBackendSyncRepoRequest
>;
export type ToBackendSyncRepoResponsePayload = z.infer<
  typeof zToBackendSyncRepoResponsePayload
>;
export type ToBackendSyncRepoResponse = z.infer<
  typeof zToBackendSyncRepoResponse
>;
